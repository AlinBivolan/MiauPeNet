const mongoose = require("mongoose");

const safetyAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      default: "",
    },

    textPreview: {
      type: String,
      default: "",
    },

    blocksSnapshot: {
      type: Array,
      default: [],
    },

    riskLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },

    flags: {
      type: [String],
      default: [],
    },

    source: {
      type: String,
      enum: ["draft", "story_submit", "story_edit"],
      default: "draft",
    },

    status: {
      type: String,
      enum: ["new", "reviewed"],
      default: "new",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SafetyAlert", safetyAlertSchema);