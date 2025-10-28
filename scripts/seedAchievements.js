require("dotenv").config({ path: "./config.env" });
const mongoose = require("mongoose");
const Achievement = require("../models/achievementModel"); // adjust path as needed
const achievements = require("../data/achievements"); // import your generated array

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
    await Achievement.deleteMany(); // optional: clears old data
    await Achievement.insertMany(achievements);
    console.log("🎉 Achievements successfully uploaded!");
    process.exit();
  } catch (error) {
    console.error("⚠️ Error seeding data:", error);
    process.exit(1);
  }
};

seedAchievements();
