const SocialMedia = require("../models/socialMediaModel");

// @desc    Get all social media links
// @route   GET /api/social-media
exports.getSocialMedia = async (req, res) => {
  try {
    const socialLinks = await SocialMedia.find();
    res.status(200).json({ success: true, data: socialLinks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a social media link
// @route   POST /api/social-media
exports.createSocialMedia = async (req, res) => {
  try {
    const { platform, url } = req.body;

    const existingPlatform = await SocialMedia.findOne({ platform });
    if (existingPlatform) {
      return res.status(400).json({ success: false, message: "Platform already exists. Please edit instead." });
    }

    const socialLink = await SocialMedia.create({ platform, url });
    res.status(201).json({ success: true, data: socialLink });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a social media link
// @route   PUT /api/social-media/:id
exports.updateSocialMedia = async (req, res) => {
  try {
    const socialLink = await SocialMedia.findById(req.params.id);
    if (!socialLink) {
      return res.status(404).json({ success: false, message: "Link not found" });
    }

    socialLink.url = req.body.url || socialLink.url;
    socialLink.platform = req.body.platform || socialLink.platform;
    
    // Check if duplicate platform exists (if platform name is changed)
    if (req.body.platform && req.body.platform !== socialLink.platform) {
       const exists = await SocialMedia.findOne({ platform: req.body.platform });
       if (exists) return res.status(400).json({success: false, message: "Platform already used"});
    }

    const updatedLink = await socialLink.save();
    res.status(200).json({ success: true, data: updatedLink });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a social media link
// @route   DELETE /api/social-media/:id
exports.deleteSocialMedia = async (req, res) => {
  try {
    const socialLink = await SocialMedia.findById(req.params.id);
    if (!socialLink) {
      return res.status(404).json({ success: false, message: "Link not found" });
    }

    await socialLink.deleteOne();
    res.status(200).json({ success: true, message: "Link removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};