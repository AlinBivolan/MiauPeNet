const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  subtitle: { type: String, default: "" },
  color: { type: String, default: "#50b9d4" },
  order: { type: Number, required: true, unique: true }
});

module.exports = mongoose.model("Category", CategorySchema);