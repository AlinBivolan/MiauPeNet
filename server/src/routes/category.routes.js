const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/category.controller");
const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");

router.get("/", auth, categoryController.getAllCategories);

// Admin
router.get("/admin", auth, admin, categoryController.getAllCategoriesAdmin);
router.get("/admin/:id", auth, admin, categoryController.getCategoryByIdAdmin);
router.post("/admin", auth, admin, categoryController.createCategory);
router.put("/admin/:id", auth, admin, categoryController.updateCategory);
router.delete("/admin/:id", auth, admin, categoryController.deleteCategory);

module.exports = router;