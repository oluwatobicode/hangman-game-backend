const express = require("express");
const morgan = require("morgan");

const app = express();

// this is use to parse json body in request
app.use(express.json());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  res.send("Hello World from the backend!");
});

module.exports = app;
