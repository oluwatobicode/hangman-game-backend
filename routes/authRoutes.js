const authController = require("../controllers/authController");
const express = require("express");

const router = express.Router();

router.post("/signup", authController.signUp);
router.post("/login", authController.login);
router.post("/logout", authController.loggedOut);

module.exports = router;
