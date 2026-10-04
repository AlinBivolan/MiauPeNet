const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const {
  getProfileAchievements,
  getProfileStats,
} = require("../controllers/profile.controller");

router.get("/:username/achievements", authMiddleware, getProfileAchievements);
router.get("/:username/stats", authMiddleware, getProfileStats);

module.exports = router;