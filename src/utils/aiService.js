import categoriesData from '../data/categories.json';

// Mock database for specific quick starts (optional optimization)
// We can keep these for instant replies if we want, or remove to force API for everything.
// Keeping them is good for predictable demos.
const MOCK_DB = {
    // "world landmarks": ... (Optional: Keep or remove. User said "Enable live external API calls".)
    // Let's rely on API primarily, but maybe keep them as immediate offline fallbacks if API key is missing?
};

// Validation Schema
const validateSchema = (data) => {
    if (!data || typeof data !== 'object') return false;
    if (!data.name || typeof data.name !== 'string') return false;
    if (!Array.isArray(data.words) || data.words.length < 5) return false;
    return true;
};

export const generateCategory = async (prompt) => {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    try {
        console.log(`[AI] Generating for theme: "${prompt}"...`);

        if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
            throw new Error("MISSING_API_KEY");
        }

        const systemPrompt = `Generate a JSON object with two keys: 'categoryName' (a cleaned version of the user input) and 'words' (an array of exactly 16 unique, distinct, and universally recognizable nouns related to the theme). Ensure words vary in difficulty. Output valid JSON only, no markdown. Theme: ${prompt}`;

        const response = await fetch(`/api/gemini/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: systemPrompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`API_ERROR: ${response.status} ${response.statusText}`);
        }

        const rawData = await response.json();
        console.log("[AI] Raw Response:", JSON.stringify(rawData, null, 2));

        // Parse content
        const textContent = rawData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textContent) throw new Error("NO_CONTENT_IN_RESPONSE");

        // Clean markdown if present
        const cleanedText = textContent.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedResult = JSON.parse(cleanedText);

        const gameReadyData = {
            id: `ai_${Date.now()}`,
            name: parsedResult.categoryName || parsedResult.name, // Handle variations
            words: parsedResult.words
        };

        if (!validateSchema(gameReadyData)) {
            throw new Error("SCHEMA_VALIDATION_FAILED: Invalid structure.");
        }

        return gameReadyData;

    } catch (error) {
        console.error("AI Service Error:", error.message);

        let errorMessage = "AI Generation Failed.";
        let fallbackMessage = "Switching to a classic category.";

        if (error.message === 'MISSING_API_KEY') {
            errorMessage = "Configuration Error";
            fallbackMessage = "API Key not found in .env. Using fallback.";
        }

        // Fallback to 'Animals'
        const animalsCategory = categoriesData.categories.find(c => c.id === 'animals')
            || categoriesData.categories[0];

        // Alert user (only if it's a real failure, maybe suppress if it's just dev env missing key?)
        // User requested "immediately alert the user and fallback"
        alert(`${errorMessage} ${fallbackMessage}\n(Theme: '${prompt}' -> 'Rare Animals')`);

        return {
            ...animalsCategory,
            id: `ai_fallback_${Date.now()}`,
            name: `✨ ${animalsCategory.name} (AI Fallback)`,
            isFallback: true
        };
    }
};

export const generateStrategicClue = async ({ role, secretWord, categoryName, existingClues, allWords }) => {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') return null;

    const prompt = role === 'civilian'
        ? `Game: Word Imposter. Category: "${categoryName}". Secret Word: "${secretWord}". Previous Clues: [${existingClues.map(c => c.text || c).join(', ')}]. 
           Task: precise 1-word clue for "${secretWord}" that is NOT the word itself and is distinct from history.
           Output JSON: { "clue": "..." }`
        : `Game: Word Imposter. Category: "${categoryName}". You are the Imposter (you don't know the word). Previous Clues: [${existingClues.map(c => c.text || c).join(', ')}]. 
           Task: Analyze clues to guess context. Give a safe, vague 1-word clue that blends in. If no clues, give a generic word for the category.
           Output JSON: { "clue": "..." }`;

    try {
        const response = await fetch(`/api/gemini/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const json = JSON.parse(text.replace(/```json|```/g, '').trim());
        return json.clue;
    } catch (e) {
        console.error("AI Clue Gen Failed", e);
        return null;
    }
};

export const generateStrategicGuess = async ({ categoryName, existingClues, allWords }) => {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') return null;

    const prompt = `Game: Word Imposter. Category: "${categoryName}". List: [${allWords.join(', ')}]. Clues: [${existingClues.map(c => c.text || c).join(', ')}]. 
                    Task: Identify the secret word from the List based on clues.
                    Output JSON: { "guess": "WORD_FROM_LIST" }`;

    try {
        const response = await fetch(`/api/gemini/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const json = JSON.parse(text.replace(/```json|```/g, '').trim());
        return json.guess;
    } catch (e) {
        console.error("AI Guess Gen Failed", e);
        return null;
    }
};
