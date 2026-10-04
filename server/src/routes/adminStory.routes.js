const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const {
  getStoriesForReview,
  approveStory,
  rejectStory,
} = require("../controllers/adminStory.controller");

function adminOnly(req, res, next) {
  if (req.role !== "admin") {
    return res.status(403).json({
      message: "Admin only",
    });
  }

  next();
}

router.get("/stories", authMiddleware, adminOnly, getStoriesForReview);
router.put("/stories/:id/approve", authMiddleware, adminOnly, approveStory);
router.put("/stories/:id/reject", authMiddleware, adminOnly, rejectStory);

module.exports = router;