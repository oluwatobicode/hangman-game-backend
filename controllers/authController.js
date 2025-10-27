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
