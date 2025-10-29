const userController = require("../controllers/userController");
const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.get("/", authController.protectedRoutes, userController.getSettings);
router.patch(
  "/",
  authController.protectedRoutes,
  userController.updateSettings
);

module.exports = router;
