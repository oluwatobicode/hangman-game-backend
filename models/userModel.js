const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  // auth
  username: {
    type: String,
    required: [true, "A username is required!"],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    minLength: 8,
    required: [true, "A password is required!"],
    select: false,
  },
  confirmPassword: {
    type: String,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Your passwords are not the same!",
    },
  },
  profile: {
    type: String,
    default: "default.jpg",
  },
  active: {
    type: Boolean,
    default: false,
    select: false,
  },

  // game-stats
  totalWins: {
    type: Number,
    default: 0,
  },
  totalLoses: {
    type: Number,
    default: 0,
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  bestStreak: {
    type: Number,
    default: 0,
  },
  rank: {
    type: Number,
    default: 0,
  },
  score: {
    type: Number,
    default: 0,
  },
  winRate: {
    type: Number,
    default: 0,
  },

  // achievements
  unlockedAchievements: [
    {
      achievementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Achievement",
      },
      unlockedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  achievementProgress: {
    gamesWithoutHint: { type: Number, default: 0 },
    perfectGames: { type: Number, default: 0 },
    categoryWins: {
      animal: { type: Number, default: 0 },
      sports: { type: Number, default: 0 },
      movies: { type: Number, default: 0 },
      science: { type: Number, default: 0 },
      history: { type: Number, default: 0 },
      tv_shows: { type: Number, default: 0 },
      countries: { type: Number, default: 0 },
      capital_cities: { type: Number, default: 0 },
    },
    difficultyWins: {
      easy: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      hard: { type: Number, default: 0 },
    },
  },

  // settings
  settings: {
    soundEnabled: { type: Boolean, default: true },
    volume: {
      type: Number,
      default: 0.7,
    },
    preferredDifficulty: {
      type: String,
      default: "easy",
      enum: ["easy", "medium", "hard"],
    },
  },

  // experimenting
  lastLogin: {
    type: Date,
  },
});

// userSchema.pre(/^find/, function (next) {
//   this.find({ active: { $ne: false } });
//   next();
// });

// hashing a password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;

  next();
});

userSchema.pre("save", async function (next) {
  this.score =
    this.totalWins * 15 + (this.unlockedAchievements?.length || 0) * 5;
  next();
});

// comparing passwords
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);

User.collection.createIndex({ score: -1 });

module.exports = User;
