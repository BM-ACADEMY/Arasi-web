const Category = require("../models/categoryModel");
const slugify = require("slugify");
const { saveImage } = require("../utils/uploadConfig");
const fs = require("fs");
const path = require("path");

// Helper: Format Image URL
const formatCategory = (cat) => ({
  ...cat._doc,
  image: cat.image ? `${process.env.SERVER_URL}/${cat.image}` : null
});

// @route   POST /api/categories
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    let imagePath = "";

    if (req.file) {
      imagePath = await saveImage(req.file.buffer, "categories", name);
    }

    const category = await Category.create({
      name,
      slug: slugify(name, { lower: true }),
      description,
      image: imagePath
    });

    res.status(201).json({ success: true, data: formatCategory(category) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route   GET /api/categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories.map(formatCategory)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/categories/:id
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    res.status(200).json({ success: true, data: formatCategory(category) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/categories/slug/:slug
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) return res.status(404).json({ message: "Category not found" });

    res.status(200).json({ success: true, data: formatCategory(category) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/categories/:id
exports.updateCategory = async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    // Handle Image Update
    if (req.file) {
      // Optional: Delete old image here using fs.unlinkSync
      const newImagePath = await saveImage(req.file.buffer, "categories", req.body.name || category.name);
      req.body.image = newImagePath;
    }

    // Handle Slug Update if name changes
    if (req.body.name) {
      req.body.slug = slugify(req.body.name, { lower: true });
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    res.status(200).json({ success: true, data: formatCategory(category) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/categories/:id
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    res.status(200).json({ success: true, message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
