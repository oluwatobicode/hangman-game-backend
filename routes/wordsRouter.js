const express = require("express");
const wordsController = require("../controllers/wordsController");

const router = express.Router();

router.post("/", wordsController.createWord);
router.get("/", wordsController.getWordByCategory);
// router.post("/ai-generate-word", wordsController.getWordByCategory);

module.exports = router;
