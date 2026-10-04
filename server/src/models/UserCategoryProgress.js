const mongoose = require("mongoose");

const UserCategoryProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    recommendedStartLevel: {
      type: Number,
      enum: [1, 2, 3],
      default: 1
    },
    lastPlacementScore: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

UserCategoryProgressSchema.index(
  { userId: 1, categoryId: 1 },
  { unique: true }
);

module.exports = mongoose.model("UserCategoryProgress", UserCategoryProgressSchema);