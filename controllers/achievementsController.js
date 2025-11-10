const Achievement = require("../models/achievementModel");
const AsyncHandler = require("express-async-handler");

exports.getAchievements = async (req, res, next) => {
  try {
    const achievements = await Achievement.find();

    res.status(200).json({
      status: "success",
      length: achievements.length,
      data: {
        achievements,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      status: "failed",
      message: "Something went wrong!, try again later",
    });
  }
};
