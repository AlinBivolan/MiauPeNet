const mongoose = require("mongoose");

const storyBlockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["text", "image"],
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const safetyCheckSchema = new mongoose.Schema(
  {
    riskLevel: {
      type: String,
      enum: ["none", "low", "medium", "high"],
      default: "none",
    },
    flags: {
      type: [String],
      default: [],
    },
    checkedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const storySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    blocks: {
      type: [storyBlockSchema],
      default: [],
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "flagged"],
      default: "pending",
    },

    moderationReason: {
      type: String,
      default: "",
    },

    safetyCheck: {
      type: safetyCheckSchema,
      default: () => ({
        riskLevel: "none",
        flags: [],
        checkedAt: new Date(),
      }),
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

module.exports = mongoose.model("Story", storySchema);