const { default: mongoose } = require("mongoose");
const morgan = require("mongoose");

const userModel = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "Kindly include your username"],
    unique: true,
    trim: true,
  },
});
