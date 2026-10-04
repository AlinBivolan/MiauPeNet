const Category = require("../models/Category");
const Lesson = require("../models/Lesson");
const Progress = require("../models/Progress");
const User = require("../models/User");
const UserCategoryProgress = require("../models/UserCategoryProgress");

function plainObject(value) {
  if (!value) return value;
  return typeof value.toObject === "function" ? value.toObject() : value;
}

function normalizeString(value) {
  return String(value ?? "").trim();
}

function getOptionId(option) {
  const raw = plainObject(option) || {};
  return normalizeString(raw.id ?? raw.answerId ?? raw._id ?? raw.value ?? "");
}

function normalizeIdArray(values = []) {
  return [...values]
    .map((value) => normalizeString(value))
    .filter(Boolean)
    .sort();
}

function lessonMatchesAgeGroup(lesson, userAgeGroup) {
  const targetAgeGroup = lesson?.targetAgeGroup || "all";

  if (targetAgeGroup === "all") return true;
  if (!userAgeGroup) return targetAgeGroup === "all";

  return targetAgeGroup === userAgeGroup;
}

function serializeScreen(screen, index) {
  const raw = plainObject(screen) || {};

  return {
    type: raw.type || "text",
    title: raw.title || "",
    text: raw.text || "",
    image: raw.image || null,
    multiple: !!raw.multiple,

    options: Array.isArray(raw.options)
      ? raw.options.map((option) => {
          const cleanOption = plainObject(option) || {};

          return {
            id: getOptionId(option),
            answerId: getOptionId(option),
            text: cleanOption.text || "",
            image: cleanOption.image || null,
          };
        })
      : [],

    hotspots: Array.isArray(raw.hotspots)
      ? raw.hotspots.map((hotspot) => {
          const cleanHotspot = plainObject(hotspot) || {};

          return {
            id: normalizeString(cleanHotspot.id ?? cleanHotspot._id ?? ""),
            x: cleanHotspot.x,
            y: cleanHotspot.y,
            width: cleanHotspot.width,
            height: cleanHotspot.height,
            radius: cleanHotspot.radius,
            shape: cleanHotspot.shape || "rect",
            label: cleanHotspot.label || "",
          };
        })
      : [],

    screenIndex: Number(index),
  };
}

function serializeLevel(levelData) {
  if (!levelData) return null;

  const raw = plainObject(levelData) || {};

  return {
    level: Number(raw.level),
    title: raw.title,
    estimatedMinutes: raw.estimatedMinutes ?? 5,
    passPercentage: raw.passPercentage ?? 70,
    screens: Array.isArray(raw.screens)
      ? raw.screens.map((screen, index) => serializeScreen(screen, index))
      : [],
  };
}

function serializeLesson(lesson) {
  if (!lesson) return null;

  const raw = plainObject(lesson) || {};

  return {
    _id: raw._id,
    categoryId: raw.categoryId,
    index: raw.index,
    title: raw.title,
    subtitle: raw.subtitle || raw.description || "",
    schemaVersion: raw.schemaVersion || 2,
    targetAgeGroup: raw.targetAgeGroup || "all",
    levels: Array.isArray(raw.levels)
      ? raw.levels.map((level) => serializeLevel(level))
      : [],
  };
}

function getQuestionScreens(levelData) {
  const rawLevel = plainObject(levelData) || {};

  return (rawLevel.screens || [])
    .map((screen, index) => {
      const rawScreen = plainObject(screen) || {};

      return {
        ...rawScreen,
        screenIndex: Number(index),
      };
    })
    .filter(
      (screen) => Array.isArray(screen.options) && screen.options.length > 0
    );
}

function isAnswerCorrect(screen, selectedOptionIds = []) {
  const rawScreen = plainObject(screen) || {};

  const correctIds = normalizeIdArray(
    (rawScreen.options || [])
      .filter((option) => {
        const rawOption = plainObject(option) || {};

        return (
          rawOption.isCorrect === true ||
          rawOption.isCorrect === "true" ||
          rawOption.correct === true ||
          rawOption.correct === "true"
        );
      })
      .map((option) => getOptionId(option))
  );

  const selectedIds = normalizeIdArray(selectedOptionIds);

  if (correctIds.length === 0) return false;
  if (correctIds.length !== selectedIds.length) return false;

  return correctIds.every((id, index) => id === selectedIds[index]);
}

function calculateLevelScorePercent(levelData, answers = []) {
  const questionScreens = getQuestionScreens(levelData);

  if (questionScreens.length === 0) {
    return 100;
  }

  const normalizedAnswers = (Array.isArray(answers) ? answers : []).map(
    (item) => ({
      screenIndex: Number(item?.screenIndex),
      selectedOptionIds: normalizeIdArray(item?.selectedOptionIds || []),
    })
  );

  let correctCount = 0;

  for (const screen of questionScreens) {
    const submitted = normalizedAnswers.find(
      (item) => item.screenIndex === Number(screen.screenIndex)
    );

    const selectedOptionIds = submitted?.selectedOptionIds || [];

    if (isAnswerCorrect(screen, selectedOptionIds)) {
      correctCount += 1;
    }
  }

  return Math.round((correctCount / questionScreens.length) * 100);
}

function isPointInRect(point, hotspot) {
  return (
    point.x >= hotspot.x &&
    point.x <= hotspot.x + hotspot.width &&
    point.y >= hotspot.y &&
    point.y <= hotspot.y + hotspot.height
  );
}

function isPointInCircle(point, hotspot) {
  const dx = point.x - hotspot.x;
  const dy = point.y - hotspot.y;

  return Math.sqrt(dx * dx + dy * dy) <= hotspot.radius;
}

function findMatchingHotspot(point, hotspots = []) {
  return hotspots.find((hotspot) => {
    const rawHotspot = plainObject(hotspot) || {};

    if (rawHotspot.shape === "circle") {
      return isPointInCircle(point, rawHotspot);
    }

    return isPointInRect(point, rawHotspot);
  });
}

// USER
exports.getLessonsByCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { categoryId } = req.params;

    const user = await User.findById(userId).select("ageGroup");
    const userAgeGroup = user?.ageGroup || null;

    const lessonsRaw = await Lesson.find({ categoryId }).sort({ index: 1 });
    const lessons = lessonsRaw.filter((lesson) =>
      lessonMatchesAgeGroup(lesson, userAgeGroup)
    );

    const progresses = await Progress.find({
      userId,
      lessonId: { $in: lessons.map((lesson) => lesson._id) },
    });

    const progressMap = {};

    for (const progress of progresses) {
      progressMap[String(progress.lessonId)] = progress;
    }

    const result = lessons.map((lesson, index) => {
      const progress = progressMap[String(lesson._id)] || null;

      let isUnlocked = false;

      if (index === 0) {
        isUnlocked = true;
      } else {
        const previousLesson = lessons[index - 1];
        const previousProgress = progressMap[String(previousLesson._id)];
        isUnlocked = previousProgress?.status === "completed";
      }

      return {
        _id: lesson._id,
        categoryId: lesson.categoryId,
        index: lesson.index,
        title: lesson.title,
        subtitle: lesson.subtitle || lesson.description || "",
        targetAgeGroup: lesson.targetAgeGroup || "all",
        levelsCount: lesson.levels?.length || 0,
        isUnlocked,
        progress: progress
          ? {
              status: progress.status,
              currentLevel: progress.currentLevel,
              completedLevels: progress.completedLevels || [],
              failedLevels: progress.failedLevels || [],
            }
          : {
              status: "not_started",
              currentLevel: null,
              completedLevels: [],
              failedLevels: [],
            },
      };
    });

    res.json(result);
  } catch (error) {
    console.error("getLessonsByCategory error:", error);
    res.status(500).json({ message: "Eroare la încărcarea lecțiilor." });
  }
};

exports.startLessonByCategoryAndIndex = async (req, res) => {
  try {
    const userId = req.user.id;
    const { categoryId, index } = req.params;

    const user = await User.findById(userId).select("ageGroup");
    const userAgeGroup = user?.ageGroup || null;

    const lesson = await Lesson.findOne({
      categoryId,
      index: Number(index),
    });

    if (!lesson || !lessonMatchesAgeGroup(lesson, userAgeGroup)) {
      return res.status(404).json({ message: "Lecția nu a fost găsită." });
    }

    if (lesson.index > 1) {
      const previousLessonsRaw = await Lesson.find({
        categoryId,
        index: { $lt: lesson.index },
      }).sort({ index: 1 });

      const previousLessons = previousLessonsRaw.filter((item) =>
        lessonMatchesAgeGroup(item, userAgeGroup)
      );

      const previousLesson = previousLessons[previousLessons.length - 1];

      if (previousLesson) {
        const previousProgress = await Progress.findOne({
          userId,
          lessonId: previousLesson._id,
        });

        if (!previousProgress || previousProgress.status !== "completed") {
          return res.status(403).json({
            message:
              "Această lecție este blocată. Finalizează mai întâi lecția anterioară.",
          });
        }
      }
    }

    let progress = await Progress.findOne({
      userId,
      lessonId: lesson._id,
    });

    if (!progress) {
      let startLevel = 1;

      if (lesson.index !== 1) {
        const categoryProgress = await UserCategoryProgress.findOne({
          userId,
          categoryId: lesson.categoryId,
        });

        startLevel = categoryProgress?.recommendedStartLevel || 1;
      }

      progress = await Progress.create({
        userId,
        lessonId: lesson._id,
        status: "in_progress",
        startLevel,
        currentLevel: startLevel,
        completedLevels: [],
        failedLevels: [],
        quizResults: [],
      });
    }

    const category = await Category.findById(lesson.categoryId);

    res.json({
      lesson: {
        ...serializeLesson(lesson),
        categoryName: category?.name || "CAPITOL",
      },
      progress,
    });
  } catch (error) {
    console.error("startLessonByCategoryAndIndex error:", error);
    res.status(500).json({ message: "Eroare la pornirea lecției." });
  }
};

exports.checkAnswer = async (req, res) => {
  try {
    const { lessonId, level } = req.params;
    const { screenIndex, selectedOptionIds = [], point = null } = req.body;

    const numericLevel = Number(level);
    const numericScreenIndex = Number(screenIndex);

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({ message: "Lecția nu a fost găsită." });
    }

    const levelData = lesson.levels.find(
      (levelItem) => Number(levelItem.level) === numericLevel
    );

    if (!levelData) {
      return res.status(404).json({ message: "Nivelul nu există." });
    }

    const rawLevel = plainObject(levelData) || {};
    const rawScreen = plainObject(rawLevel.screens?.[numericScreenIndex]) || null;

    if (!rawScreen) {
      return res.status(404).json({ message: "Întrebarea nu există." });
    }

    if (Array.isArray(rawScreen.options) && rawScreen.options.length > 0) {
      const isCorrect = isAnswerCorrect(rawScreen, selectedOptionIds);

      const firstCorrectOption = rawScreen.options.find((option) => {
        const rawOption = plainObject(option) || {};
        return rawOption.isCorrect === true || rawOption.isCorrect === "true";
      });

      const rawCorrectOption = plainObject(firstCorrectOption) || {};

      return res.json({
        isCorrect,
        successText: rawCorrectOption.explainCorrect || "Răspuns corect.",
        failText: "Răspuns greșit. Întrebarea va reveni la final.",
      });
    }

    if (rawScreen.type === "image_hotspot") {
      if (!point) {
        return res.status(400).json({ message: "Nu ai selectat niciun punct." });
      }

      const matchedHotspot = findMatchingHotspot(point, rawScreen.hotspots || []);
      const rawMatchedHotspot = plainObject(matchedHotspot) || {};
      const isCorrect =
        rawMatchedHotspot.isCorrect === true ||
        rawMatchedHotspot.isCorrect === "true";

      return res.json({
        isCorrect,
        successText:
          rawMatchedHotspot.explainCorrect ||
          "Corect. Ai identificat zona suspectă.",
        failText: "Nu ai apăsat pe zona corectă. Întrebarea va reveni la final.",
      });
    }

    return res.status(400).json({
      message: "Acest ecran nu este o întrebare.",
    });
  } catch (error) {
    console.error("checkAnswer error:", error);
    res.status(500).json({ message: "Eroare la verificarea răspunsului." });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lessonId, level } = req.params;
    const { answers = [] } = req.body;

    const numericLevel = Number(level);

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({ message: "Lecția nu a fost găsită." });
    }

    const progress = await Progress.findOne({ userId, lessonId });

    if (!progress) {
      return res.status(404).json({ message: "Progresul nu a fost găsit." });
    }

    const levelData = lesson.levels.find(
      (levelItem) => Number(levelItem.level) === numericLevel
    );

    if (!levelData) {
      return res.status(404).json({ message: "Nivelul nu există." });
    }

    const publicLevel = serializeLevel(levelData);
    const scorePercent = calculateLevelScorePercent(levelData, answers);
    const passPercentage = publicLevel.passPercentage || 70;
    const passed = scorePercent >= passPercentage;

    const existingResult = progress.quizResults.find(
      (result) => Number(result.level) === numericLevel
    );

    if (existingResult) {
      existingResult.scorePercent = scorePercent;
      existingResult.passed = passed;
      existingResult.attempts += 1;
    } else {
      progress.quizResults.push({
        level: numericLevel,
        scorePercent,
        passed,
        attempts: 1,
      });
    }

    if (passed) {
      if (!progress.completedLevels.includes(numericLevel)) {
        progress.completedLevels.push(numericLevel);
      }

      progress.failedLevels = progress.failedLevels.filter(
        (failedLevel) => Number(failedLevel) !== numericLevel
      );

      if (numericLevel < 3) {
        progress.currentLevel = numericLevel + 1;
        progress.status = "in_progress";
      } else {
        progress.status = "completed";
      }
    } else {
      if (!progress.failedLevels.includes(numericLevel)) {
        progress.failedLevels.push(numericLevel);
      }

      progress.currentLevel = numericLevel;
      progress.status = "in_progress";
    }

    await progress.save();

    if (lesson.index === 1 && progress.status === "completed") {
      const totalAttempts = progress.quizResults.reduce(
        (sum, item) => sum + (item.attempts || 1),
        0
      );

      const extraAttempts = Math.max(0, totalAttempts - 3);

      let recommendedStartLevel = 1;

      if (extraAttempts === 0) {
        recommendedStartLevel = 3;
      } else if (extraAttempts <= 2) {
        recommendedStartLevel = 2;
      } else {
        recommendedStartLevel = 1;
      }

      const avgFinalScore =
        progress.quizResults.reduce((sum, item) => sum + item.scorePercent, 0) /
        progress.quizResults.length;

      await UserCategoryProgress.findOneAndUpdate(
        { userId, categoryId: lesson.categoryId },
        {
          userId,
          categoryId: lesson.categoryId,
          recommendedStartLevel,
          lastPlacementScore: avgFinalScore,
        },
        { upsert: true, new: true }
      );
    }

    const updatedLesson = await Lesson.findById(lessonId);
    const nextLevelData = updatedLesson.levels.find(
      (levelItem) => Number(levelItem.level) === Number(progress.currentLevel)
    );

    res.json({
      passed,
      scorePercent,
      progress,
      nextLevel:
        passed && numericLevel < 3 ? serializeLevel(nextLevelData) : null,
      message: passed
        ? numericLevel === 3
          ? "Ai finalizat lecția."
          : "Ai trecut nivelul."
        : "Nu ai trecut nivelul. Reîncearcă același nivel.",
    });
  } catch (error) {
    console.error("submitQuiz error:", error);
    res.status(500).json({ message: "Eroare la trimiterea rezultatului." });
  }
};

exports.getRoadmap = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("ageGroup");
    const userAgeGroup = user?.ageGroup || null;

    const categories = await Category.find().sort({ order: 1 });
    const allLessonsRaw = await Lesson.find().sort({ index: 1 });
    const progressesRaw = await Progress.find({ userId });

    const allLessons = allLessonsRaw
      .filter((lesson) => lesson && lesson._id && lesson.categoryId)
      .filter((lesson) => lessonMatchesAgeGroup(lesson, userAgeGroup));

    const progresses = progressesRaw.filter((progress) => progress?.lessonId);

    const progressMap = {};

    for (const progress of progresses) {
      progressMap[String(progress.lessonId)] = progress;
    }

    const roadmap = [];

    for (
      let categoryIndex = 0;
      categoryIndex < categories.length;
      categoryIndex++
    ) {
      const category = categories[categoryIndex];
      if (!category || !category._id) continue;

      const categoryIdStr = String(category._id);

      const lessons = allLessons
        .filter((lesson) => String(lesson.categoryId) === categoryIdStr)
        .sort((a, b) => a.index - b.index);

      if (lessons.length === 0) continue;

      let chapterUnlocked = categoryIndex === 0;

      if (categoryIndex > 0) {
        const previousCategory = categories[categoryIndex - 1];

        if (previousCategory && previousCategory._id) {
          const previousCategoryIdStr = String(previousCategory._id);

          const previousCategoryLessons = allLessons.filter(
            (lesson) => String(lesson.categoryId) === previousCategoryIdStr
          );

          chapterUnlocked =
            previousCategoryLessons.length > 0 &&
            previousCategoryLessons.every((lesson) => {
              const progress = progressMap[String(lesson._id)];
              return progress?.status === "completed";
            });
        }
      }

      const mappedLessons = lessons.map((lesson, lessonIndex) => {
        const progress = progressMap[String(lesson._id)];

        let isUnlocked = false;

        if (!chapterUnlocked) {
          isUnlocked = false;
        } else if (lessonIndex === 0) {
          isUnlocked = true;
        } else {
          const previousLesson = lessons[lessonIndex - 1];
          const previousLessonProgress = previousLesson
            ? progressMap[String(previousLesson._id)]
            : null;

          isUnlocked = previousLessonProgress?.status === "completed";
        }

        return {
          _id: lesson._id,
          categoryId: lesson.categoryId,
          index: lesson.index,
          title: lesson.title,
          subtitle: lesson.subtitle || lesson.description || "",
          targetAgeGroup: lesson.targetAgeGroup || "all",
          levelsCount: lesson.levels?.length || 0,
          isUnlocked,
          progress: progress
            ? {
                status: progress.status,
                currentLevel: progress.currentLevel,
                completedLevels: progress.completedLevels || [],
              }
            : {
                status: "not_started",
                currentLevel: null,
                completedLevels: [],
              },
        };
      });

      roadmap.push({
        _id: category._id,
        key: category.key,
        name: category.name,
        subtitle: category.subtitle || "",
        color: category.color,
        isUnlocked: chapterUnlocked,
        lessons: mappedLessons,
      });
    }

    res.json(roadmap);
  } catch (error) {
    console.error("getRoadmap error:", error);
    res.status(500).json({ message: "Eroare la încărcarea roadmap-ului." });
  }
};

// ADMIN
exports.getAllLessonsAdmin = async (req, res) => {
  try {
    const lessons = await Lesson.find()
      .populate("categoryId", "name key color order")
      .sort({ createdAt: -1 });

    res.json(lessons);
  } catch (error) {
    console.error("getAllLessonsAdmin error:", error);
    res.status(500).json({ message: "Eroare la încărcarea lecțiilor." });
  }
};

exports.getLessonByIdAdmin = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate(
      "categoryId",
      "name key color order"
    );

    if (!lesson) {
      return res.status(404).json({ message: "Lecția nu a fost găsită." });
    }

    res.json(lesson);
  } catch (error) {
    console.error("getLessonByIdAdmin error:", error);
    res.status(500).json({ message: "Eroare la încărcarea lecției." });
  }
};

exports.createLessonAdmin = async (req, res) => {
  try {
    const { categoryId, index, title, subtitle, targetAgeGroup, levels } =
      req.body;

    if (!categoryId || !index || !title || !Array.isArray(levels)) {
      return res.status(400).json({
        message: "categoryId, index, title și levels sunt obligatorii.",
      });
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(400).json({ message: "Categoria selectată nu există." });
    }

    const existingLesson = await Lesson.findOne({
      categoryId,
      index: Number(index),
    });

    if (existingLesson) {
      return res.status(400).json({
        message: "Există deja o lecție cu acest index în categoria selectată.",
      });
    }

    const lesson = await Lesson.create({
      categoryId,
      index: Number(index),
      title: String(title).trim(),
      subtitle: String(subtitle || "").trim(),
      schemaVersion: 2,
      targetAgeGroup: targetAgeGroup || "all",
      levels,
    });

    res.status(201).json(lesson);
  } catch (error) {
    console.error("createLessonAdmin error:", error);
    res.status(500).json({ message: "Eroare la crearea lecției." });
  }
};

exports.updateLessonAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, index, title, subtitle, targetAgeGroup, levels } =
      req.body;

    const lesson = await Lesson.findById(id);

    if (!lesson) {
      return res.status(404).json({ message: "Lecția nu a fost găsită." });
    }

    if (categoryId !== undefined) {
      const category = await Category.findById(categoryId);

      if (!category) {
        return res.status(400).json({ message: "Categoria selectată nu există." });
      }

      lesson.categoryId = categoryId;
    }

    if (index !== undefined) {
      const numericIndex = Number(index);

      const existingLesson = await Lesson.findOne({
        categoryId: categoryId || lesson.categoryId,
        index: numericIndex,
        _id: { $ne: id },
      });

      if (existingLesson) {
        return res.status(400).json({
          message: "Există deja o lecție cu acest index în categoria selectată.",
        });
      }

      lesson.index = numericIndex;
    }

    if (title !== undefined) lesson.title = String(title).trim();
    if (subtitle !== undefined) lesson.subtitle = String(subtitle).trim();
    if (targetAgeGroup !== undefined) lesson.targetAgeGroup = targetAgeGroup;
    if (levels !== undefined) lesson.levels = levels;

    await lesson.save();

    res.json(lesson);
  } catch (error) {
    console.error("updateLessonAdmin error:", error);
    res.status(500).json({ message: "Eroare la actualizarea lecției." });
  }
};

exports.deleteLessonAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findById(id);

    if (!lesson) {
      return res.status(404).json({ message: "Lecția nu a fost găsită." });
    }

    await Progress.deleteMany({ lessonId: id });
    await Lesson.findByIdAndDelete(id);

    res.json({ message: "Lecția a fost ștearsă." });
  } catch (error) {
    console.error("deleteLessonAdmin error:", error);
    res.status(500).json({ message: "Eroare la ștergerea lecției." });
  }
};