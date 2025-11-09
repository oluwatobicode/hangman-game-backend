const express = require("express");
const gameController = require("../controllers/gameController");
const authController = require("../controllers/authController");
const router = express.Router();

router.post("/", gameController.createWord);
router.get("/start", authController.protectedRoutes, gameController.startGame);
router.post(
  "/leaderboard",
  authController.protectedRoutes,
  gameController.leaderboard
);
router.post("/end", authController.protectedRoutes, gameController.endGame);
// router.post("/ai-generate-word", wordsController.getWordByCategory);

module.exports = router;
