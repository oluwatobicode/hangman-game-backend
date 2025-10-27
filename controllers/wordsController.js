const Words = require("../models/wordsModel");

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

exports.getWords = async (req, res, next) => {
  try {
    const allWords = await Words.find();
    res.status(200).json({
      status: "success",
      total: allWords.length,
      data: {
        allWords,
      },
    });
  } catch (error) {
    console.log(error);
  }

  next();
};
