import categoriesData from '../data/categories.json';

// API Key - hardcoded for reliability
const GEMINI_API_KEY = 'AIzaSyCpEOKlteGylVcT8XeROJMMfWNmv4fZqEs';

// Validation Schema
const validateSchema = (data) => {
    if (!data || typeof data !== 'object') return false;
    if (!data.name || typeof data.name !== 'string') return false;
    if (!Array.isArray(data.words) || data.words.length < 5) return false;
    return true;
};

// Helper to call Gemini API
const callGeminiAPI = async (prompt) => {
    console.log('[Gemini] Making API request...');
    console.log('[Gemini] API Key present:', !!GEMINI_API_KEY);

    // Using direct URL - no proxy
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    console.log('[Gemini] URL:', url);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        })
    });

    console.log('[Gemini] Response status:', response.status);

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[Gemini] Error response:', errorText);
        throw new Error(`API_ERROR: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[Gemini] Response data:', data);
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
};

export const generateCategory = async (prompt, language = 'en') => {
    console.log('=== GENERATE CATEGORY CALLED ===');
    console.log('[AI/Gemini] Theme:', prompt);
    console.log('[AI/Gemini] Language:', language);

    const langInst = language === 'jp' ? "in Japanese (Katakana or Kanji as appropriate)" : "in English";
    const systemPrompt = `Generate a JSON object with two keys: 'categoryName' (a cleaned version of the user input) and 'words' (an array of exactly 16 unique, distinct, and universally recognizable nouns related to the theme). Ensure words vary in difficulty. Words must be ${langInst}. Output valid JSON only, no markdown code blocks. Theme: ${prompt}`;

    try {
        const textContent = await callGeminiAPI(systemPrompt);

        console.log('[AI/Gemini] Raw response:', textContent);

        if (!textContent) throw new Error("NO_CONTENT_IN_RESPONSE");

        const cleanedText = textContent.replace(/```json/g, '').replace(/```/g, '').trim();
        console.log('[AI/Gemini] Cleaned text:', cleanedText);

        const parsedResult = JSON.parse(cleanedText);
        console.log('[AI/Gemini] Parsed result:', parsedResult);

        const gameReadyData = {
            id: `ai_${Date.now()}`,
            name: parsedResult.categoryName || parsedResult.name,
            words: parsedResult.words
        };

        console.log("✅ AI Words Generated:", gameReadyData.words);
        console.log("✅ AI Category Name:", gameReadyData.name);

        if (!validateSchema(gameReadyData)) {
            throw new Error("SCHEMA_VALIDATION_FAILED: Invalid structure.");
        }

        return gameReadyData;

    } catch (error) {
        console.error("❌ AI Service Error:", error);
        throw error;
    }
};

export const generateStrategicClue = async ({ role, secretWord, categoryName, existingClues, allWords, language = 'en', aiDifficulty = 'medium' }) => {
    if (!GEMINI_API_KEY) return null;

    const langInstr = language === 'jp' ? "Respond in Japanese." : "Respond in English.";
    const diffInstr = aiDifficulty === 'easy' ? "Give a simple, often too-obvious clue."
        : aiDifficulty === 'hard' ? "Give a highly strategic, subtle clue that mimics the semantic style of human players."
            : "Give a balanced clue.";

    const prompt = role === 'civilian'
        ? `Game: Word Imposter. Category: "${categoryName}". Secret Word: "${secretWord}". Previous Clues: [${existingClues.map(c => c.text || c).join(', ')}]. 
           Task: precise 1-word clue for "${secretWord}" that is NOT the word itself and is distinct from history. ${diffInstr} ${langInstr}
           Output JSON only: { "clue": "..." }`
        : `Game: Word Imposter. Category: "${categoryName}". You are the Imposter (you don't know the word). Previous Clues: [${existingClues.map(c => c.text || c).join(', ')}]. 
           Task: Analyze clues to guess context. Give a safe, vague 1-word clue that blends in. If no clues, give a generic word for the category. ${diffInstr} ${langInstr}
           Output JSON only: { "clue": "..." }`;

    try {
        const text = await callGeminiAPI(prompt);
        const json = JSON.parse(text.replace(/```json|```/g, '').trim());
        return json.clue;
    } catch (e) {
        console.error("AI Clue Gen Failed", e);
        return null;
    }
};

export const generateStrategicGuess = async ({ categoryName, existingClues, allWords, language = 'en' }) => {
    if (!GEMINI_API_KEY) return null;

    const langInstr = language === 'jp' ? "Respond in Japanese." : "Respond in English.";
    const prompt = `Game: Word Imposter. Category: "${categoryName}". List: [${allWords.join(', ')}]. Clues: [${existingClues.map(c => c.text || c).join(', ')}]. 
                    Task: Identify the secret word from the List based on clues. ${langInstr}
                    Output JSON only: { "guess": "WORD_FROM_LIST" }`;

    try {
        const text = await callGeminiAPI(prompt);
        const json = JSON.parse(text.replace(/```json|```/g, '').trim());
        return json.guess;
    } catch (e) {
        console.error("AI Guess Gen Failed", e);
        return null;
    }
};
