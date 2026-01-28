const express = require("express");
const router = express.Router();
const { getBanner, updateBanner } = require("../controllers/bannerController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { upload } = require("../utils/uploadConfig");

router.get("/", getBanner);

// 'image' is the key we use in FormData on the frontend
router.post("/", protect, authorize("admin"), upload.single("image"), updateBanner);

module.exports = router;
