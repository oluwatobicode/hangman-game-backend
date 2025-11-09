const app = require("./app");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const redis = require("redis");
require("./cron/wordGenerator");

dotenv.config({ path: "./config.env" });

// mongodb connect

const DB = process.env.DATABASE.replace(
  "<db_password>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => console.log("connected to the database successfully."))
  .catch((err) => console.log(err));

const port = process.env.PORT || 4000;

// redis connect

// const client = redis.createClient({
//   username: process.env.REDIS_USERNAME,
//   password: process.env.REDIS_PASSWORD,
//   socket: {
//     host: process.env.REDIS_HOST,
//     port: process.env.REDIS_PORT,
//   },
// });

// // Handle connection events
// client.on("connect", () => {
//   console.log("Redis client connected");
// });

// client.on("error", (err) => {
//   console.error("Redis Error:", err);
// });

// Connect to Redis
// client.connect().then(() => {
//
//   app.listen(port, () => {
//     console.log(`I am listening on app ${port}`);
//   });
// });

app.listen(port, () => {
  console.log(`I am listening on app ${port}`);
});
