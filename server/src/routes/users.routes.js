const express = require("express");
const router = express.Router();

const { getUserProfileByUsername } = require("../controllers/users.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.get("/:username", authMiddleware, getUserProfileByUsername);

module.exports = router;