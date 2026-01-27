const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { upload } = require("../utils/uploadConfig");
const {
  createSubCategory,
  getAllSubCategories,
  getSubCategoryById,
  getSubCategoryBySlug, // Added
  updateSubCategory,
  deleteSubCategory
} = require("../controllers/subCategoryController");

const router = express.Router();

router.route("/")
  .get(getAllSubCategories)
  .post(protect, authorize("admin"), upload.single("image"), createSubCategory);

// New Slug Route
router.route("/slug/:slug").get(getSubCategoryBySlug);

router.route("/:id")
  .get(getSubCategoryById)
  .put(protect, authorize("admin"), upload.single("image"), updateSubCategory)
  .delete(protect, authorize("admin"), deleteSubCategory);

module.exports = router;