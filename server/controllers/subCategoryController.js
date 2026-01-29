const SubCategory = require("../models/subCategoryModel");
const Product = require("../models/productModel");
const slugify = require("slugify");
const { saveImage } = require("../utils/uploadConfig");
const fs = require("fs");
const path = require("path");

const formatSubCat = (sub) => ({
  ...sub._doc,
  image: sub.image ? `${process.env.SERVER_URL}/${sub.image}` : null,
  category: sub.category ? sub.category : { name: "Uncategorized" }
});

const deleteImage = (relativePath) => {
  if (!relativePath) return;
  const fullPath = path.join(__dirname, "../public", relativePath);
  if (fs.existsSync(fullPath)) {
    try { fs.unlinkSync(fullPath); } catch (e) { console.error(e); }
  }
};

exports.createSubCategory = async (req, res) => {
  try {
    const { name, category } = req.body;

    const subCategoryCount = await SubCategory.countDocuments({ category: category });
    
    if (subCategoryCount >= 5) {
      return res.status(400).json({ 
        success: false, 
        message: "Limit reached: You can only create 5 subcategories for this category." 
      });
    }
    // ---------------------------------------------------

    let imagePath = "";

    if (req.file) {
      imagePath = await saveImage(req.file.buffer, "subcategories", name);
    }

    const subCategory = await SubCategory.create({
      name,
      slug: slugify(name, { lower: true }),
      category,
      image: imagePath
    });

    const populatedSub = await SubCategory.findById(subCategory._id).populate("category", "name");
    res.status(201).json({ success: true, data: formatSubCat(populatedSub) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


exports.getAllSubCategories = async (req, res) => {
  try {
    // --- UPDATED: Allow filtering by Parent Category ---
    let query = { isActive: true };
    if (req.query.category) {
      query.category = req.query.category;
    }

    const subCategories = await SubCategory.find(query)
      .populate("category", "name")
      .sort({ createdAt: -1 });
      
    res.status(200).json({
      success: true,
      count: subCategories.length,
      data: subCategories.map(formatSubCat)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSubCategoryById = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id).populate("category", "name");
    if (!subCategory) return res.status(404).json({ message: "SubCategory not found" });
    res.status(200).json({ success: true, data: formatSubCat(subCategory) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- NEW: Get SubCategory by Slug ---
exports.getSubCategoryBySlug = async (req, res) => {
  try {
    const subCategory = await SubCategory.findOne({ slug: req.params.slug }).populate("category", "name");
    if (!subCategory) return res.status(404).json({ message: "SubCategory not found" });
    res.status(200).json({ success: true, data: formatSubCat(subCategory) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSubCategory = async (req, res) => {
  try {
    let subCategory = await SubCategory.findById(req.params.id);
    if (!subCategory) return res.status(404).json({ message: "SubCategory not found" });

    if (req.file) {
      deleteImage(subCategory.image);
      const newPath = await saveImage(req.file.buffer, "subcategories", req.body.name || subCategory.name);
      req.body.image = newPath;
    }

    if (req.body.name) req.body.slug = slugify(req.body.name, { lower: true });

    subCategory = await SubCategory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate("category", "name");

    res.status(200).json({ success: true, data: formatSubCat(subCategory) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteSubCategory = async (req, res) => {
  try {
    const subCategoryId = req.params.id;

    // Check for Dependent Products
    const hasProducts = await Product.findOne({ subCategory: subCategoryId });
    if (hasProducts) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot delete: This subcategory is used in products." 
      });
    }

    const subCategory = await SubCategory.findById(subCategoryId);
    if (!subCategory) return res.status(404).json({ message: "SubCategory not found" });

    deleteImage(subCategory.image);
    await subCategory.deleteOne();

    res.status(200).json({ success: true, message: "SubCategory deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};