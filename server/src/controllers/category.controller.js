const Category = require("../models/Category");
const Lesson = require("../models/Lesson");

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1 });
    res.json(categories);
  } catch (error) {
    console.error("getAllCategories error:", error);
    res.status(500).json({ message: "Eroare la încărcarea categoriilor." });
  }
};

exports.getAllCategoriesAdmin = async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1 });
    res.json(categories);
  } catch (error) {
    console.error("getAllCategoriesAdmin error:", error);
    res.status(500).json({ message: "Eroare la încărcarea categoriilor." });
  }
};

exports.getCategoryByIdAdmin = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Categoria nu a fost găsită." });
    }

    res.json(category);
  } catch (error) {
    console.error("getCategoryByIdAdmin error:", error);
    res.status(500).json({ message: "Eroare la încărcarea categoriei." });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { key, name, subtitle, color, order } = req.body;

    if (!key || !name || order === undefined) {
      return res.status(400).json({
        message: "key, name și order sunt obligatorii."
      });
    }

    const existingKey = await Category.findOne({ key: String(key).trim() });
    if (existingKey) {
      return res.status(400).json({ message: "Există deja o categorie cu acest key." });
    }

    const existingOrder = await Category.findOne({ order: Number(order) });
    if (existingOrder) {
      return res.status(400).json({ message: "Există deja o categorie cu acest order." });
    }

    const category = await Category.create({
      key: String(key).trim(),
      name: String(name).trim(),
      subtitle: String(subtitle || "").trim(),
      color: color || "#50b9d4",
      order: Number(order)
    });

    res.status(201).json(category);
  } catch (error) {
    console.error("createCategory error:", error);
    res.status(500).json({ message: "Eroare la crearea categoriei." });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { key, name, subtitle, color, order } = req.body;
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Categoria nu a fost găsită." });
    }

    if (key !== undefined) {
      const existingKey = await Category.findOne({
        key: String(key).trim(),
        _id: { $ne: id }
      });

      if (existingKey) {
        return res.status(400).json({ message: "Există deja o categorie cu acest key." });
      }

      category.key = String(key).trim();
    }

    if (name !== undefined) category.name = String(name).trim();
    if (subtitle !== undefined) category.subtitle = String(subtitle).trim();
    if (color !== undefined) category.color = color;

    if (order !== undefined) {
      const existingOrder = await Category.findOne({
        order: Number(order),
        _id: { $ne: id }
      });

      if (existingOrder) {
        return res.status(400).json({ message: "Există deja o categorie cu acest order." });
      }

      category.order = Number(order);
    }

    await category.save();
    res.json(category);
  } catch (error) {
    console.error("updateCategory error:", error);
    res.status(500).json({ message: "Eroare la actualizarea categoriei." });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Categoria nu a fost găsită." });
    }

    const lessonsCount = await Lesson.countDocuments({ categoryId: id });
    if (lessonsCount > 0) {
      return res.status(400).json({
        message: "Categoria nu poate fi ștearsă pentru că are lecții asociate."
      });
    }

    await Category.findByIdAndDelete(id);

    res.json({ message: "Categoria a fost ștearsă." });
  } catch (error) {
    console.error("deleteCategory error:", error);
    res.status(500).json({ message: "Eroare la ștergerea categoriei." });
  }
};