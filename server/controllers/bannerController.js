const Banner = require("../models/bannerModel");
const fs = require('fs');
const path = require('path');

// Get the current banner
exports.getBanner = async (req, res) => {
  try {
    const banner = await Banner.findOne(); // Get the first one found
    res.status(200).json({ success: true, banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create or Update the banner
exports.updateBanner = async (req, res) => {
  try {
    const { tagline, heading, description } = req.body;
    let imagePath = null;

    if (req.file) {
      imagePath = `uploads/banners/${req.file.filename}`;
    }

    // Check if a banner already exists
    let banner = await Banner.findOne();

    if (banner) {
      // Update existing
      banner.tagline = tagline || banner.tagline;
      banner.heading = heading || banner.heading;
      banner.description = description || banner.description;

      if (imagePath) {
        // Optional: Delete old image to save space
        if (banner.image) {
            const oldPath = path.join(__dirname, `../public/${banner.image}`);
            if(fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        banner.image = imagePath;
      }

      await banner.save();
    } else {
      // Create new
      if (!imagePath) return res.status(400).json({ success: false, message: "Image is required for first time creation" });

      banner = await Banner.create({
        tagline,
        heading,
        description,
        image: imagePath
      });
    }

    res.status(200).json({ success: true, message: "Banner updated successfully", banner });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update banner" });
  }
};
