const express = require("express");
const router = express.Router();
const { getBanners, createBanner, updateBanner, deleteBanner } = require("../controllers/bannerController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { upload } = require("../utils/uploadConfig");

// Public: Get all banners
router.get("/", getBanners);

// Admin: Create
router.post("/", protect, authorize("admin"), upload.single("image"), createBanner);

// Admin: Update (requires ID)
router.put("/:id", protect, authorize("admin"), upload.single("image"), updateBanner);

// Admin: Delete (requires ID)
router.delete("/:id", protect, authorize("admin"), deleteBanner);

module.exports = router;