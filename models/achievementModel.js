const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema(
  {
    achievementId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "win_count",
        "streak",
        "category",
        "no_hint",
        "difficulty",
        "speed",
        "perfect",
        "special",
      ],
    },
    requirement: {
      type: mongoose.Schema.Types.Mixed,
      require: true,
    },
    rarity: {
      type: String,
      enum: ["common", "rare", "epic", "legendary"],
      default: "common",
    },
    points: {
      type: Number,
      default: 10,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Achievement = mongoose.model("Achievement", achievementSchema);
module.exports = Achievement;
