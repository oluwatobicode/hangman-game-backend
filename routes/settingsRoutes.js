const userController = require("../controllers/userController");
const express = require("express");

const router = express.Router();

router.get("/:id", userController.getSettings);
router.patch("/:id", userController.updateSettings);

module.exports = router;
