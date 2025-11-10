const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const AsyncHandler = require("express-async-handler");
const { sendEmail } = require("../services/email");

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
    secure: process.env.NODE_ENV === "production",
    maxAge: cookieExpireDays * 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
  });
};

exports.signUp = async (req, res) => {
  try {
    const user = await User.create(req.body);

    sendEmail(user.email, user.username, "Welcome to Hangman game!").catch(
      (err) => console.error("Email error:", err)
    );

    createSendToken(user, 201, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong!, try again later",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide username and password",
      });
    }

    const user = await User.findOne({ username }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect username or password",
      });
    }

    createSendToken(user, 200, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

exports.protectedRoutes = AsyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({
      status: "fail",
      message: "You are not logged in. Please log in to get access.",
    });
  }

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return res.status(401).json({
      status: "fail",
      message: "The user no longer exists. Please log in again.",
    });
  }

  req.user = currentUser;
  next();
});

exports.loggedOut = AsyncHandler(async (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});
