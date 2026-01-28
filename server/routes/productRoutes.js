const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { upload } = require("../utils/uploadConfig");
const {
  createProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

const router = express.Router();



router.route("/")
  .get(getAllProducts) // Search via query params ?keyword=abc
  .post(protect, authorize("admin"), upload.array("images", 5), createProduct);

router.route("/:id")
  .get(getProductById) // ID Search
  .put(protect, authorize("admin"), upload.array("images", 5), updateProduct)
  .delete(protect, authorize("admin"), deleteProduct);

router.route("/slug/:slug")
  .get(getProductBySlug); // Slug Search

module.exports = router;
