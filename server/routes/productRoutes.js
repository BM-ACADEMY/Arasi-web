// routes/productRoutes.js
const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { upload } = require("../utils/uploadConfig");
const {
  createProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  getBestSellers // <--- Import
} = require("../controllers/productController");

const router = express.Router();

// 1. Base Route /api/products
router.route("/")
  .get(getAllProducts) 
  .post(protect, authorize("admin"), upload.array("images", 5), createProduct);

// --- NEW ROUTE ---
router.get("/best-sellers", getBestSellers);
// -----------------

// 2. ID Route /api/products/:id
router.route("/:id")
  .get(getProductById)
  .put(protect, authorize("admin"), upload.array("images", 5), updateProduct)
  .delete(protect, authorize("admin"), deleteProduct);

// 3. Slug Route /api/products/slug/:slug
router.get("/slug/:slug", getProductBySlug);

module.exports = router;