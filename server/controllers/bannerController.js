const Banner = require("../models/bannerModel");
const fs = require('fs');
const path = require('path');
const { saveImage } = require("../utils/uploadConfig"); // Ensure this is imported

// 1. Get ALL Banners
exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Create New Banner
exports.createBanner = async (req, res) => {
  try {
    const { tagline, heading, description } = req.body;
    let imagePath = null;

    if (req.file) {
        // Save image using your utility
        imagePath = await saveImage(req.file.buffer, "banners", req.file.originalname);
    } else {
        return res.status(400).json({ success: false, message: "Image is required" });
    }

    const banner = await Banner.create({
      tagline,
      heading,
      description,
      image: imagePath
    });

    res.status(201).json({ success: true, message: "Banner created successfully", banner });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create banner" });
  }
};

// 3. Update Banner by ID
exports.updateBanner = async (req, res) => {
  try {
    const { tagline, heading, description } = req.body;
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
        return res.status(404).json({ success: false, message: "Banner not found" });
    }

    banner.tagline = tagline || banner.tagline;
    banner.heading = heading || banner.heading;
    banner.description = description || banner.description;

    if (req.file) {
      // Delete old image
      if (banner.image) {
        const oldPath = path.join(__dirname, `../public/${banner.image}`);
        if(fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      // Save new image
      banner.image = await saveImage(req.file.buffer, "banners", req.file.originalname);
    }

    await banner.save();
    res.status(200).json({ success: true, message: "Banner updated", banner });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update banner" });
  }
};

// 4. Delete Banner by ID
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: "Banner not found" });

    // Delete image file
    if (banner.image) {
        const imagePath = path.join(__dirname, `../public/${banner.image}`);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    }

    // Delete from DB
    await Banner.deleteOne({ _id: req.params.id });

    res.status(200).json({ success: true, message: "Banner deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to delete banner" });
  }
};