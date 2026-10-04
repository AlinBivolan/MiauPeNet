const mongoose = require("mongoose");

const GameProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    completedGames: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

GameProgressSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model("GameProgress", GameProgressSchema);