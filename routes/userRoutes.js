const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const express = require("express");

const router = express.Router();

router.post("/signup", authController.signUp);
router.post("/login", authController.login);
router.post("/logout", authController.loggedOut);
// user-profile-section
router.get("/me", userController.getMyProfile);

module.exports = router;
