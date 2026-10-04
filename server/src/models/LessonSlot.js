const mongoose = require("mongoose");

const lessonSlotSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  index: { type: Number, required: true },
  type: { type: String, enum: ["normal", "final"], default: "normal" },
  title: { type: String, required: true }
});

lessonSlotSchema.index({ categoryId: 1, index: 1 }, { unique: true });

module.exports = mongoose.model("LessonSlot", lessonSlotSchema);