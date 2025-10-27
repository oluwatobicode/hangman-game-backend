const Words = require("../models/wordsModel");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const getWords = async () => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Generate ${WORDS_PER_CATEGORY} random words for Hangman game in category: ${category}.

Rules:
- Single words only (no spaces/hyphens)
- 4-10 letters long
- Common enough to guess
- Family-friendly
- Variety in difficulty

Return as comma-separated list, e.g: ELEPHANT,TIGER,PENGUIN`,
  });

  console.log(response.text);
};

exports.createWord = async (req, res, next) => {
  const newWord = await Words.create(req.body);

  // await getWords();

  try {
    res.status(200).json({
      status: "success",
      data: {
        newWord,
      },
    });
  } catch (error) {
    console.log(error);
  }

  next();
};

exports.getWordByCategory = async (req, res, next) => {
  console.log(req);
  const { category } = req.query;

  try {
    const count = await Words.countDocuments({ category });

    if (count === 0) {
      res.status(400).json({
        status: "fail",
        message: "there was no word found for this category",
      });
    }

    // Get random word using aggregation
    const [word] = await Words.aggregate([
      { $match: { category } },
      { $sample: { size: 1 } }, // MongoDB's random selector
    ]);

    // Update usage stats
    await Words.findByIdAndUpdate(word._id, {
      $inc: { usedCount: 1 },
      lastUsedAt: new Date(),
    });

    res.status(200).json({
      status: "success",
      data: {
        word: word.word,
        id: word._id,
        category: word.category,
        hint: word.hint,
        difficulty: word.difficulty,
        length: word.word.length,
      },
    });
  } catch (error) {
    console.log(error);
  }

  next();
};
