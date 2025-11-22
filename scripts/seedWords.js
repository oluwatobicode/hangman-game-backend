require("dotenv").config({ path: "./config.env" });
const mongoose = require("mongoose");
const Words = require("../models/wordsModel");
const words = require("../data/words");

const DB = process.env.DATABASE.replace(
  "<db_password>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ DB connection failed:", err));

const seedWords = async () => {
  try {
    // Delete existing achievements
    await Words.deleteMany({});
    console.log("Existing words deleted");

    // Insert new achievements
    await Words.insertMany(words);
    console.log(`${words.length} words successfully seeded!`);

    process.exit();
  } catch (error) {
    console.error("Error seeding words:", error);
    process.exit(1);
  }
};

seedWords();
