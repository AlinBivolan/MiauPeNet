const express = require("express");
const router = express.Router();

const lessonController = require("../controllers/lesson.controller");
const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

// User
router.get("/roadmap", authMiddleware, lessonController.getRoadmap);

router.get(
  "/category/:categoryId",
  authMiddleware,
  lessonController.getLessonsByCategory
);

router.get(
  "/play/:categoryId/:index",
  authMiddleware,
  lessonController.startLessonByCategoryAndIndex
);

router.post(
  "/:lessonId/level/:level/check-answer",
  authMiddleware,
  lessonController.checkAnswer
);

router.post(
  "/:lessonId/level/:level/submit-quiz",
  authMiddleware,
  lessonController.submitQuiz
);

// Admin
router.get(
  "/admin/all",
  authMiddleware,
  adminMiddleware,
  lessonController.getAllLessonsAdmin
);

router.get(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  lessonController.getLessonByIdAdmin
);

router.post(
  "/admin",
  authMiddleware,
  adminMiddleware,
  lessonController.createLessonAdmin
);

router.put(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  lessonController.updateLessonAdmin
);

router.delete(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  lessonController.deleteLessonAdmin
);

module.exports = router;