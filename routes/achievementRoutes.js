const express = require("express");
const router = express.Router();
const achievementsController = require("../controllers/achievementsController");

router.get("/", achievementsController.getAchievements);

module.exports = router;

/* 

- jwt token for sign-up & log-in
- welcome email after they sign-up
- make the ai to populate the words database and connect to my cron job
- track user achievements when the game ends
- set protected routes for some routes
- setting up routes for when game start 
- setting up routes for when game ends
*/
