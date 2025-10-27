const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
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
  totalWins: {
    type: String,
    default: 0,
  },
  totalLoses: {
    type: String,
    default: 0,
  },
  lastLogin: {
    type: Date,
  },
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;

  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
