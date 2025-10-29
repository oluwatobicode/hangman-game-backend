const User = require("../models/userModel");

exports.signUp = async (req, res, next) => {
  console.log(req.body);

  const newUser = await User.create(req.body);

  console.log(newUser);

  try {
    res.status(200).json({
      status: "success",
      data: {
        newUser,
      },
    });
  } catch (error) {
    console.log(error);
  }

  next();
};
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    console.log(req.body);

    if (!username || !password) {
      return res.status(400).json({
        status: "fail",
        message: "kindly provide an email & password",
      });
    }

    const user = await User.findOne({ username }).select("+password");

    // console.log(user);

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(400).json({
        status: "fail",
        message: "your password is not correct",
      });
    }

    res.status(200).json({
      status: "success",
      message: "log in successful",
      data: { user },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};
