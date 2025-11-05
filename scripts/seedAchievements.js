require("dotenv").config({ path: "./config.env" });
const mongoose = require("mongoose");
const Achievement = require("../models/achievementModel");
const achievements = require("../data/achievements");

const DB = process.env.DATABASE.replace(
  "<db_password>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ DB connection failed:", err));

const seedAchievements = async () => {
  try {
    // Delete existing achievements
    await Achievement.deleteMany({});
    console.log("Existing achievements deleted");

    // Insert new achievements
    await Achievement.insertMany(achievements);
    console.log(`${achievements.length} achievements successfully seeded!`);

    process.exit();
  } catch (error) {
    console.error("Error seeding achievements:", error);
    process.exit(1);
  }
};

seedAchievements();
