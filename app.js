const express = require("express");
const morgan = require("morgan");

// routes handler
const userRoutes = require("./routes/userRoutes");
const wordsRoutes = require("./routes/wordsRouter");
const achievementsRouter = require("./routes/achievementRoutes");
const settingsRouter = require("./routes/settingsRoutes");

const app = express();

// this is use to parse json body in request
app.use(express.json());

// development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/words", wordsRoutes);
app.use("/api/v1/achievements", achievementsRouter);
app.use("/api/v1/settings", settingsRouter);

module.exports = app;
