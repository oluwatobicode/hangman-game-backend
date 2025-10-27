const mongoose = require("mongoose");

const wordsSchema = new mongoose.Schema(
  {
    word: {
      type: String,
      required: [true, "a word must be passed in"],
      unique: true,
      uppercase: true,
      trim: true,
      // minLength: 3,
      // maxLength: 10,
    },
    category: {
      type: String,
      required: true,
      lowercase: true,
      enum: [
        "animal",
        "sports",
        "tv shows",
        "movies",
        "capital cities",
        "countries",
      ],
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    difficulty: {
      enum: ["easy", "medium", "hard"],
      default: "easy",
      type: String,
    },
    hint: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Word = mongoose.model("Word", wordsSchema);
module.exports = Word;
