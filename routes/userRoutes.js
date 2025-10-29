const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const express = require("express");

const router = express.Router();

router.post("/signup", authController.signUp);
router.post("/login", authController.login);

// user-profile-section
router.get("/:id", userController.getMyProfile); // it would change to /me sha

module.exports = router;
