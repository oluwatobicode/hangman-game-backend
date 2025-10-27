const express = require("express");
const morgan = require("morgan");

// routes handler
const userRoutes = require("./routes/userRoutes");
const wordsRoutes = require("./routes/wordsRouter");
const app = express();

// this is use to parse json body in request
app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/words", wordsRoutes);
module.exports = app;
