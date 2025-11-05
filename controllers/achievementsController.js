const Achievement = require("../models/achievementModel");
const AsyncHandler = require("express-async-handler");

exports.getAchievements = async (req, res, next) => {
  try {
    const achievements = await Achievement.find();

    // console.log(achievements);

    res.status(200).json({
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
};

exports.trackAchievements = AsyncHandler(async (req, res, next) => {
  try {
    const { id } = req.body;
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
});
