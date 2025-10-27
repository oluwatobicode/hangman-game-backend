require("dotenv").config({ path: "config.env" });

const { OpenAI } = require("openai");
const Words = require("../models/wordsModel");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const prompt = `
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
- Create exactly **5 words per category** (total = 30 words).
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
  }
]
`;

const generateWordPerCategory = async () => {
  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini", // or "gpt-4.1" if you have access
      input: prompt,
    });

    const text = response.output[0].content[0].text;
    console.log("📝 Raw response:", text);

    // Parse JSON
    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]");
    const jsonStr = text.slice(jsonStart, jsonEnd + 1);
    const words = JSON.parse(jsonStr);

    // await Words.insertMany(words);
    console.log(`✅ Successfully generated and saved ${words.length} words`);
  } catch (error) {
    console.error("❌ Error generating words:", error.message);
    console.log(error);
  }
};

module.exports = { generateWordPerCategory };
