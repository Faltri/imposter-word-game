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

export const generateCategory = async (prompt, language = 'en') => {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    try {
        console.log(`[AI] Generating for theme: "${prompt}" [${language}]...`);

        if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
            throw new Error("MISSING_API_KEY");
        }

        const langInst = language === 'jp' ? "in Japanese (Katakana or Kanji as appropriate)" : "in English";
        const systemPrompt = `Generate a JSON object with two keys: 'categoryName' (a cleaned version of the user input) and 'words' (an array of exactly 16 unique, distinct, and universally recognizable nouns related to the theme). Ensure words vary in difficulty. Words must be ${langInst}. Output valid JSON only, no markdown. Theme: ${prompt}`;

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
        const textContent = rawData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textContent) throw new Error("NO_CONTENT_IN_RESPONSE");

        const cleanedText = textContent.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedResult = JSON.parse(cleanedText);

        const gameReadyData = {
            id: `ai_${Date.now()}`,
            name: parsedResult.categoryName || parsedResult.name,
            words: parsedResult.words
        };

        if (!validateSchema(gameReadyData)) {
            throw new Error("SCHEMA_VALIDATION_FAILED: Invalid structure.");
        }

        return gameReadyData;

    } catch (error) {
        // ... (Error handling remains similar, slightly condensed if needed)
        console.error("AI Service Error:", error.message);
        const animalsCategory = categoriesData.categories.find(c => c.id === 'animals') || categoriesData.categories[0];
        return {
            ...animalsCategory,
            id: `ai_fallback_${Date.now()}`,
            name: `✨ ${animalsCategory.name} (AI Fallback)`,
            isFallback: true
        };
    }
};

export const generateStrategicClue = async ({ role, secretWord, categoryName, existingClues, allWords, language = 'en', aiDifficulty = 'medium' }) => {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') return null;

    const langInstr = language === 'jp' ? "Respond in Japanese." : "Respond in English.";
    const diffInstr = aiDifficulty === 'easy' ? "Give a simple, often too-obvious clue."
        : aiDifficulty === 'hard' ? "Give a highly strategic, subtle clue that mimics the semantic style of human players."
            : "Give a balanced clue.";

    const prompt = role === 'civilian'
        ? `Game: Word Imposter. Category: "${categoryName}". Secret Word: "${secretWord}". Previous Clues: [${existingClues.map(c => c.text || c).join(', ')}]. 
           Task: precise 1-word clue for "${secretWord}" that is NOT the word itself and is distinct from history. ${diffInstr} ${langInstr}
           Output JSON: { "clue": "..." }`
        : `Game: Word Imposter. Category: "${categoryName}". You are the Imposter (you don't know the word). Previous Clues: [${existingClues.map(c => c.text || c).join(', ')}]. 
           Task: Analyze clues to guess context. Give a safe, vague 1-word clue that blends in. If no clues, give a generic word for the category. ${diffInstr} ${langInstr}
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

export const generateStrategicGuess = async ({ categoryName, existingClues, allWords, language = 'en' }) => {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') return null;

    const langInstr = language === 'jp' ? "Respond in Japanese." : "Respond in English.";
    const prompt = `Game: Word Imposter. Category: "${categoryName}". List: [${allWords.join(', ')}]. Clues: [${existingClues.map(c => c.text || c).join(', ')}]. 
                    Task: Identify the secret word from the List based on clues. ${langInstr}
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
