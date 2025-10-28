const app = require("./app");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
require("./cron/wordGenerator");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<db_password>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => console.log("connected to the database successfully."))
  .catch((err) => console.log(err));

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`I am listening on app ${port}`);
});
