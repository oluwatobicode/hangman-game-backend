const mongoose = require("mongoose");

const wordsSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  category: {
    type: String,
  },
});

const Word = mongoose.model("Word", wordsSchema);
module.exports = Word;
