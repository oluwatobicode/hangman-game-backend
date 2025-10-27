const Words = require("../models/wordsModel");
const { generateWordPerCategory } = require("../services/aiGenWord");

exports.createWord = async (req, res, next) => {
  const newWord = await Words.create(req.body);

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

exports.createWordWithAI = async (req, res, next) => {
  try {
    const result = await generateWordPerCategory();

    res.status(200).json({
      status: "success",
      message: "Words generated successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};
