const Achievement = require("../models/achievementModel");

exports.getAchievements = async (req, res, next) => {
  try {
    const achievements = await Achievement.find().select("__v");

    // console.log(achievements);

    res.status(201).json({
      status: "success",
      length: achievements.length,
      data: {
        achievements,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }

  next();
};
