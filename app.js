const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

// routes handler
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const gameRoutes = require("./routes/gameRouter");
const achievementsRoutes = require("./routes/achievementRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const app = express();

// this is use to parse json body in request
app.use(express.json());

// development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(cookieParser());

app.use("/api/v1/auth", authRoutes); // done
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/game", gameRoutes);
app.use("/api/v1/achievements", achievementsRoutes);
app.use("/api/v1/settings", settingsRoutes);

module.exports = app;
