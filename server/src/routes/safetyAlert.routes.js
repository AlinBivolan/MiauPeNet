const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const {
  checkDraftSafety,
  getSafetyAlerts,
  markSafetyAlertReviewed,
} = require("../controllers/safetyAlert.controller");

function adminOnly(req, res, next) {
  if (req.role !== "admin") {
    return res.status(403).json({
      message: "Admin only",
    });
  }

  next();
}

router.post("/draft-check", authMiddleware, checkDraftSafety);
router.get("/alerts", authMiddleware, adminOnly, getSafetyAlerts);
router.put(
  "/alerts/:id/reviewed",
  authMiddleware,
  adminOnly,
  markSafetyAlertReviewed
);

module.exports = router;