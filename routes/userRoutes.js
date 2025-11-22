const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const express = require("express");

const router = express.Router();

// user-profile-section
router.get(
  "/profile",
  authController.protectedRoutes,
  userController.getMyProfile
);

// router.get(
//     "/:userID/achievements",
//     authController.protectedRoutes,
//     userController.getUserAchievements,
// )

module.exports = router;
