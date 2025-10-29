const express = require("express");
const router = express.Router();
const { getAchievements } = require("../controllers/achievementsController");

router.get("/", getAchievements);

module.exports = router;
