const express = require("express");
const router = express.Router();
const achievementsController = require("../controllers/achievementsController");
const authController = require("../controllers/authController");

router.get(
  "/",
  authController.protectedRoutes,
  achievementsController.getAchievements
);

module.exports = router;

/* 

- jwt token for sign-up & log-in done✅
- welcome email after they sign-up
- make the ai to populate the words database and connect to my cron job
- track user achievements when the game ends
- set protected routes for some routes done✅
- setting up routes for when game start 
- setting up routes for when game ends
*/

/* 

these are the end points i may need 
login endpoint [
this receives username and password and it
uses a valid jwt token for 90 days to not necessary do sign-up and login everytime
]
signup endpoint [
this receives username and password 
]
fetching a random word from the backend [
this receive just the category
]
fetching achievements from the backend  [
nil
]
checking if an achievemnet was unlocked [
it recives a user, gameData
]
end game [
this receivves 
      gameId,
      won,
      usedHint,
      wrongGuesses,
      duration,
]
start game [
it returns me a 
gameID
random word
category
difficulty
hint
]



P.S - IF YOU SEE A SQUAe BRACKET IT MEANS THE API IS NOT REVEOVONG ANYTHI NG



*/
