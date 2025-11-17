const express = require("express");
const morgan = require("morgan");

// security middlewares
const cookieParser = require("cookie-parser");
const expressRateLimit = require("express-rate-limit");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const { xss } = require("express-xss-sanitizer");
const hpp = require("hpp");

// routes handler
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const gameRoutes = require("./routes/gameRouter");
const achievementsRoutes = require("./routes/achievementRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const app = express();

/* security everything here */

// this is for handling CORS
app.use(
  cors({
    origin: [
      // "https://hangman-game-frontend.vercel.app",
      // "https://hangman-game-backend-85n0.onrender.com",
      "*",
    ],
    // credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(xss()); // this is to prevent xss attacks

// this is to prevent mongodb operator injection(no-sql injection)
// app.use(mongoSanitize());

// this is a basic rate limiter
const limiter = expressRateLimit.rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: "To many requests made, try again later",
});

// this is to prevent http parameter pollution
app.use(
  hpp({
    whitelist: ["username", "category", "difficulty"],
  })
);

// this is use to parse json body in request
app.use(express.json({ limit: "10kb" }));

// development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(cookieParser());

/* this handles global errors */
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    error: "Something went wrong!, try again later",
  });
});

/* this are my routes */

app.use(limiter);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/game", gameRoutes);
app.use("/api/v1/achievements", achievementsRoutes);
app.use("/api/v1/leaderboard", gameRoutes);
app.use("/api/v1/settings", settingsRoutes);

module.exports = app;
