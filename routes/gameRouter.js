const express = require("express");
const gameController = require("../controllers/gameController");
const authController = require("../controllers/authController");
const router = express.Router();

router.post("/", gameController.createWord);
router.get("/start", authController.protectedRoutes, gameController.startGame);
router.post("/end", authController.protectedRoutes, gameController.endGame);

// leaderboard route
router.get("/", gameController.leaderboard);

module.exports = router;
