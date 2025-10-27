const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `
    You are an AI word generator for a Hangman game.

Your job is to generate **a total of 120 JSON objects** — each representing a word entry for the game.

The output MUST strictly be in **valid JSON array format**, with **no explanations or comments**.

Each object should have the following structure:
{
  "word": "STRING",           // The word to guess (UPPERCASE)
  "category": "STRING",       // One of the allowed categories
  "difficulty": "STRING",     // "easy", "medium", or "hard"
  "hint": "STRING"            // A short, clear clue about the word
}

**Categories**:
["animal", "sports", "tv shows", "movies", "capital cities", "countries"]

**Rules for generation**:
- Create exactly **20 words per category** (total = 120 words).
- Each category must contain a **balanced difficulty**:
  - ~7 easy
  - ~7 medium
  - ~6 hard
- Ensure hints are creative, accurate, and concise.
- Use widely known, family-friendly words (no obscure or offensive terms).
- Each word must be unique across all categories.
- All words should be in UPPERCASE.
- Do not include markdown or extra formatting.

Your final output must look like this:

[
  {
    "word": "ELEPHANT",
    "category": "animal",
    "difficulty": "medium",
    "hint": "Large African mammal with trunk"
  },
  {
    "word": "BASKETBALL",
    "category": "sports",
    "difficulty": "easy",
    "hint": "Game played with a ball and a hoop"
  },
  ...
]
    
    `,
  });

  console.log(response);
}

await main();
