const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const AsyncHandler = require("express-async-handler");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieExpireDays = parseInt(process.env.JWT_COOKIE_EXPIRES_IN) || 7;
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
    secure: false,
  };

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  });
};

exports.signUp = async (req, res) => {
  try {
    console.log(req.body);

    const user = await User.create(req.body);
    createSendToken(user, 201, res);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
    1;
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: "fail",
        message: "kindly provide an email & password",
      });
    }

    const user = await User.findOne({ username }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(400).json({
        status: "fail",
        message: "your password is not correct",
      });
    }

    createSendToken(user, 200, res);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

/* 



Decode the token to extract the user’s ID.

Find the user in the database using that ID.

Check if the user still exists and hasn’t been deleted.

Grant access by attaching the user to the request and calling the next function.

Deny access if any check fails.
*/

// 1)Create a middleware that runs before protected routes.

exports.protectedRoutes = AsyncHandler(async (req, res, next) => {
  // 1) Check for a token (from cookie or authorization header).
  let token;

  console.log(req.headers.authorization);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  console.log(token);

  if (!token) {
    return res.status(400).json({
      status: "fail",
      message: "kindly log back in",
    });
  }

  // 2)Verify the token’s validity using your secret key.
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return res.status(400).json({
      status: "fail",
      message: "The user does not longer exist.",
    });
  }

  console.log(req.user);

  req.user = currentUser;

  next();
});

exports.loggedOut = AsyncHandler(async (req, res, next) => {
  try {
    res.clearCookie("jwt");

    res.status(200).json({
      status: "success",
      message: "logged out successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "failed!",
      message: error.message,
    });
  }
});
