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
    required: [true, "Please confirm your password!"],
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

  // achievements
  unlockedAchievements: [
    {
      achievementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "achievements",
      },
      unlockedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  achievementProgress: {
    gamesWithoutHint: { type: Number, default: 0 },
    categoryWins: {
      animal: { type: Number, default: 0 },
      sports: { type: Number, default: 0 },
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

// comparing passwords
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
