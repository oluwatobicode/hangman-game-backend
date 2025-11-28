const User = require("../models/userModel");

exports.getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "unlockedAchievements.achievementId"
    );

    if (!user) {
      return res.status(400).json({
        status: "fail",
        message: "Kindly log in!",
      });
    }

    res.status(200).json({
      status: "success",
      data: { user },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);

    res.status(400).json({
      status: "fail",
      message: "Something went wrong!, try again later",
    });
  }
};

exports.getSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("settings");

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        settings: user.settings,
      },
    });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    res.status(400).json({
      status: "fail",
      message: "Something went wrong!, try again later",
    });
  }
};

exports.updateSettings = async (req, res) => {
  const { id } = req.params;
  const { soundEnabled, volume, preferredDifficulty } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      id,
      {
        settings: {
          soundEnabled,
          volume,
          preferredDifficulty,
        },
      },
      { new: true, runValidators: true }
    ).select("settings");

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(201).json({
      status: "success",
      data: {
        settings: user.settings,
      },
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    res.status(400).json({
      status: "fail",
      message: "Something went wrong!, try again later",
    });
  }
};
