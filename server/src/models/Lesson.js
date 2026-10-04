const mongoose = require("mongoose");

const OptionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    explainCorrect: { type: String, default: "" }
  },
  { _id: false }
);

const ImageSchema = new mongoose.Schema(
  {
    src: { type: String, required: true },
    alt: { type: String, default: "" }
  },
  { _id: false }
);

const HotspotSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    shape: {
      type: String,
      enum: ["rect", "circle"],
      default: "rect"
    },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    radius: { type: Number, default: 0 },
    isCorrect: { type: Boolean, default: true },
    explainCorrect: { type: String, default: "" }
  },
  { _id: false }
);

const ScreenSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "text",
        "text_image",
        "image",
        "text_options",
        "text_image_options",
        "image_options",
        "image_hotspot"
      ],
      required: true
    },
    title: { type: String, default: "" },
    text: { type: String, default: "" },
    image: { type: ImageSchema, default: null },
    multiple: { type: Boolean, default: false },
    options: { type: [OptionSchema], default: [] },
    hotspots: { type: [HotspotSchema], default: [] }
  },
  { _id: false }
);

const LevelSchema = new mongoose.Schema(
  {
    level: { type: Number, enum: [1, 2, 3], required: true },
    title: { type: String, required: true },
    estimatedMinutes: { type: Number, default: 5 },
    passPercentage: { type: Number, default: 70 },
    screens: { type: [ScreenSchema], default: [] }
  },
  { _id: false }
);

const LessonSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    index: { type: Number, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    schemaVersion: { type: Number, default: 2 },
    targetAgeGroup: {
      type: String,
      enum: ["all", "under_12", "over_or_equal_12"],
      default: "all"
    },
    levels: {
      type: [LevelSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length === 3;
        },
        message: "O lecție trebuie să aibă exact 3 nivele."
      }
    }
  },
  { timestamps: true }
);

LessonSchema.index({ categoryId: 1, index: 1 }, { unique: true });

module.exports = mongoose.model("Lesson", LessonSchema);