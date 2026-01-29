const Category = require("../models/categoryModel");
const SubCategory = require("../models/subCategoryModel"); // Import SubCategory
const Product = require("../models/productModel"); // Import Product
const slugify = require("slugify");
const { saveImage } = require("../utils/uploadConfig");
const fs = require("fs");
const path = require("path");

// --- Helper: Format Image URL for Frontend ---
const formatCategory = (cat) => ({
  ...cat._doc,
  image: cat.image ? `${process.env.SERVER_URL}/${cat.image}` : null
});

// --- Helper: Delete File from Filesystem ---
const deleteImage = (relativePath) => {
  if (!relativePath) return;
  const fullPath = path.join(__dirname, "../public", relativePath); 
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
    } catch (err) {
      console.error("Error deleting image:", err);
    }
  }
};

// controllers/categoryController.js

exports.createCategory = async (req, res) => {
  try {
    // --- NEW LOGIC: Check Limit (Max 10) ---
    const categoryCount = await Category.countDocuments();
    if (categoryCount >= 10) {
      return res.status(400).json({ 
        success: false, 
        message: "Limit reached: You can only create up to 10 categories." 
      });
    }
    // ---------------------------------------

    const { name } = req.body;
    let imagePath = "";

    if (req.file) {
      imagePath = await saveImage(req.file.buffer, "categories", name);
    }

    const category = await Category.create({
      name,
      slug: slugify(name, { lower: true }),
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
    const categories = await Category.find({ isActive: true }).sort({ createdAt: -1 });
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
      deleteImage(category.image); // Delete old image
      const newImagePath = await saveImage(req.file.buffer, "categories", req.body.name || category.name);
      req.body.image = newImagePath;
    }

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
    const categoryId = req.params.id;

    // 1. Check for Dependent Subcategories
    const hasSubCategories = await SubCategory.findOne({ category: categoryId });
    if (hasSubCategories) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot delete: This category has linked subcategories." 
      });
    }

    // 2. Check for Dependent Products
    const hasProducts = await Product.findOne({ category: categoryId });
    if (hasProducts) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot delete: This category contains products." 
      });
    }

    // 3. Find and Delete
    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: "Category not found" });

    deleteImage(category.image); // Delete image from folder
    await category.deleteOne();  // Delete from DB

    res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};