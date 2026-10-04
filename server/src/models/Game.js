const mongoose = require("mongoose");

const HelperItemSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    letter: { type: String, required: true },
  },
  { _id: false }
);

const GameSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      enum: ["caesar", "morse", "binary"],
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    subtitle: {
      type: String,
      default: "",
      trim: true,
    },

    difficulty: {
      type: String,
      enum: ["Ușor", "Mediu", "Greu"],
      default: "Ușor",
    },

    estimatedMinutes: {
      type: Number,
      default: 5,
    },

    icon: {
      type: String,
      default: "🎮",
    },

    order: {
      type: Number,
      required: true,
      unique: true,
    },

    story: {
      type: String,
      required: true,
    },

    explanation: {
      type: String,
      required: true,
    },

    encodedLabel: {
      type: String,
      default: "Mesaj",
    },

    encodedMessage: {
      type: String,
      required: true,
    },

    hint: {
      type: String,
      default: "",
    },

    task: {
      type: String,
      required: true,
    },

    helperTable: {
      type: [HelperItemSchema],
      default: [],
    },

    correctAnswer: {
      type: String,
      required: true,
      select: false,
    },

    acceptedAnswers: {
      type: [String],
      default: [],
      select: false,
    },

    successText: {
      type: String,
      default: "Corect!",
    },

    failText: {
      type: String,
      default: "Răspuns greșit. Mai încearcă.",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

GameSchema.index({ order: 1 });

module.exports = mongoose.model("Game", GameSchema);