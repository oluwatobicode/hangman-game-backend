const mongoose = require("mongoose");
const validator = require("validator");

const userModel = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A username is required!"],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    minLength: 8,
    required: [true, "A password is required!"],
  },
  confirmPassword: {
    type: String,
    validate: {
      validator: (el) => {
        return el === this.password;
      },
      message: "Your passwords are not the same!",
    },
  },
  profile: {
    type: String,
    default: "default.jpg",
  },
});

const User = mongoose.model("User", userModel);
module.exports = User;
