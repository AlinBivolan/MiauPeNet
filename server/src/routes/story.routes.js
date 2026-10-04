const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const { storyImageUpload } = require("../middleware/upload.middleware");
const {
  safetyCheckDraft,
  uploadStoryImage,
  createStory,
  updateStory,
  deleteStory,
  getFeedStories,
  getStoriesByUsername,
} = require("../controllers/story.controller");

router.post("/safety-check", authMiddleware, safetyCheckDraft);

router.get("/feed", authMiddleware, getFeedStories);
router.get("/user/:username", authMiddleware, getStoriesByUsername);

router.post(
  "/upload-image",
  authMiddleware,
  storyImageUpload.single("image"),
  uploadStoryImage
);

router.post("/", authMiddleware, createStory);
router.put("/:id", authMiddleware, updateStory);
router.delete("/:id", authMiddleware, deleteStory);

module.exports = router;