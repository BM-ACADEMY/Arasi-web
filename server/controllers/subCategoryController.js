const SubCategory = require("../models/subCategoryModel");
const slugify = require("slugify");
const { saveImage } = require("../utils/uploadConfig");

const formatSubCat = (sub) => ({
  ...sub._doc,
  image: sub.image ? `${process.env.SERVER_URL}/${sub.image}` : null
});

exports.createSubCategory = async (req, res) => {
  try {
    const { name, category } = req.body; // Ensure frontend sends 'category' ID
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

    res.status(201).json({ success: true, data: formatSubCat(subCategory) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.find({ isActive: true }).populate("category", "name");
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

exports.updateSubCategory = async (req, res) => {
  try {
    let subCategory = await SubCategory.findById(req.params.id);
    if (!subCategory) return res.status(404).json({ message: "SubCategory not found" });

    if (req.file) {
      const newPath = await saveImage(req.file.buffer, "subcategories", req.body.name || subCategory.name);
      req.body.image = newPath;
    }

    if (req.body.name) req.body.slug = slugify(req.body.name, { lower: true });

    subCategory = await SubCategory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    res.status(200).json({ success: true, data: formatSubCat(subCategory) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findByIdAndDelete(req.params.id);
    if (!subCategory) return res.status(404).json({ message: "SubCategory not found" });
    res.status(200).json({ success: true, message: "SubCategory deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
