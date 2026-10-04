const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

const {
  getAllGamesAdmin,
  getGameByIdAdmin,
  createGameAdmin,
  updateGameAdmin,
  deleteGameAdmin,
} = require("../controllers/adminGame.controller");

router.get("/games", authMiddleware, adminMiddleware, getAllGamesAdmin);
router.get("/games/:id", authMiddleware, adminMiddleware, getGameByIdAdmin);
router.post("/games", authMiddleware, adminMiddleware, createGameAdmin);
router.put("/games/:id", authMiddleware, adminMiddleware, updateGameAdmin);
router.delete("/games/:id", authMiddleware, adminMiddleware, deleteGameAdmin);

module.exports = router;