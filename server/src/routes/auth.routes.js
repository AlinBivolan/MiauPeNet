const express = require("express");
const router = express.Router();

const {
  register,
  login,
  me,
  profile,
  updateProfile,
  updateAvatar,
  updateCoverImage,
} = require("../controllers/auth.controller");

const authMiddleware = require("../middleware/auth.middleware");
const {
  avatarUpload,
  coverUpload,
} = require("../middleware/upload.middleware");

// PUBLIC
router.post("/register", register);
router.post("/login", login);

// PROTECTED
router.get("/me", authMiddleware, me);
router.get("/profile", authMiddleware, profile);
router.put("/profile", authMiddleware, updateProfile);
router.put(
  "/profile/avatar",
  authMiddleware,
  avatarUpload.single("avatar"),
  updateAvatar
);
router.put(
  "/profile/cover",
  authMiddleware,
  coverUpload.single("coverImage"),
  updateCoverImage
);

module.exports = router;