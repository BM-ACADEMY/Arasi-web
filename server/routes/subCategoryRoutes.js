const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { upload } = require("../utils/uploadConfig");
const {
  createSubCategory,
  getAllSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory
} = require("../controllers/subCategoryController");

const router = express.Router();

router.route("/")
  .get(getAllSubCategories)
  .post(protect, authorize("admin"), upload.single("image"), createSubCategory);

router.route("/:id")
  .get(getSubCategoryById) // ID Search
  .put(protect, authorize("admin"), upload.single("image"), updateSubCategory)
  .delete(protect, authorize("admin"), deleteSubCategory);

module.exports = router;
