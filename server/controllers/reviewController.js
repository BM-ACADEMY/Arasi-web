const Review = require("../models/reviewModel");

// Get reviews for a specific product
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name") // Get user name for display
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Simple create review (optional, for testing)
exports.createReview = async (req, res) => {
  try {
    const { rating, comment, productId } = req.body;
    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      comment
    });
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
