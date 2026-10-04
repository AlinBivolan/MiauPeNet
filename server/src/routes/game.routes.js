const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const {
  getGames,
  getGameById,
  checkGameAnswer,
} = require("../controllers/game.controller");

router.get("/", authMiddleware, getGames);
router.get("/:gameId", authMiddleware, getGameById);
router.post("/:gameId/check", authMiddleware, checkGameAnswer);

module.exports = router;