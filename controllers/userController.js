const User = require("../models/userModel");

exports.getMyProfile = async (req, res, next) => {
  try {
    // Assuming you have auth middleware that sets req.user
    const user = await User.findById(req.user.id); // it is actually meant to be req.user.id

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
    res.status(400).json({
      status: "fail",
      message: error.message,
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
    console.log(error);
    res.status(400).json({
      status: "fail",
      message: error.message,
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
    console.log(error);
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};
