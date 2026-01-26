const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { upload } = require("../utils/uploadConfig");
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory
} = require("../controllers/categoryController");

const router = express.Router();

router.route("/")
  .get(getAllCategories)
  .post(protect, authorize("admin"), upload.single("image"), createCategory);

router.route("/:id")
  .get(getCategoryById) // ID Based Search
  .put(protect, authorize("admin"), upload.single("image"), updateCategory)
  .delete(protect, authorize("admin"), deleteCategory);

router.route("/slug/:slug")
  .get(getCategoryBySlug); // Slug Based Search

module.exports = router;
