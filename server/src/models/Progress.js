const mongoose = require("mongoose");

const LevelResultSchema = new mongoose.Schema(
  {
    level: { type: Number, enum: [1, 2, 3], required: true },
    scorePercent: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    attempts: { type: Number, default: 1 }
  },
  { _id: false }
);

const ProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true
    },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started"
    },
    startLevel: { type: Number, enum: [1, 2, 3], default: 1 },
    currentLevel: { type: Number, enum: [1, 2, 3], default: 1 },
    completedLevels: [{ type: Number, enum: [1, 2, 3] }],
    failedLevels: [{ type: Number, enum: [1, 2, 3] }],
    quizResults: [LevelResultSchema]
  },
  { timestamps: true }
);

ProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

module.exports = mongoose.model("Progress", ProgressSchema);