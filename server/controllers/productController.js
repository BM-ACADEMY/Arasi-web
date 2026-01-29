const Product = require("../models/productModel");
const Category = require("../models/categoryModel"); // Imported
const SubCategory = require("../models/subCategoryModel"); // Imported
const slugify = require("slugify");
const { saveImage } = require("../utils/uploadConfig");
const fs = require("fs");
const path = require("path");

const formatProduct = (product) => ({
  ...product._doc,
  images: product.images.map(img => `${process.env.SERVER_URL}/${img}`)
});

const deleteImage = (relativePath) => {
  if (!relativePath) return;
  const fullPath = path.join(__dirname, "../public", relativePath);
  if (fs.existsSync(fullPath)) try { fs.unlinkSync(fullPath); } catch (e) {}
};

exports.createProduct = async (req, res) => {
  try {
    const { name, variants, details } = req.body;

    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const path = await saveImage(file.buffer, "products", name);
        imagePaths.push(path);
      }
    }

    let parsedVariants = variants;
    if (typeof variants === 'string') parsedVariants = JSON.parse(variants);

    let parsedDetails = details;
    if (typeof details === 'string') parsedDetails = JSON.parse(details);

    const product = await Product.create({
      ...req.body,
      slug: slugify(name, { lower: true }),
      images: imagePaths,
      variants: parsedVariants,
      details: parsedDetails
    });

    res.status(201).json({ success: true, data: formatProduct(product) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const { keyword, category, subCategory } = req.query;
    let query = { isActive: true };

    // --- SMART SEARCH LOGIC ---
    if (keyword) {
      const searchRegex = new RegExp(keyword, "i");

      // 1. Find Categories matching the keyword
      const matchingCategories = await Category.find({ name: searchRegex }).select('_id');
      const categoryIds = matchingCategories.map(cat => cat._id);

      // 2. Find SubCategories matching the keyword
      const matchingSubCategories = await SubCategory.find({ name: searchRegex }).select('_id');
      const subCategoryIds = matchingSubCategories.map(sub => sub._id);

      // 3. Build Query: Name OR Brand OR Category Match OR SubCategory Match
      query.$or = [
        { name: searchRegex },
        { brand: searchRegex },
        { category: { $in: categoryIds } },
        { subCategory: { $in: subCategoryIds } }
      ];
    }
    // ---------------------------

    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;

    const products = await Product.find(query)
      .populate("category", "name")
      .populate("subCategory", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products.map(formatProduct)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
        .populate("category", "name")
        .populate("subCategory", "name");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ success: true, data: formatProduct(product) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
        .populate("category", "name")
        .populate("subCategory", "name");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ success: true, data: formatProduct(product) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ... imports remain the same

exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // 1. Handle New Uploads
    const newImagePaths = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Use either new name or existing name for file storage
        const path = await saveImage(file.buffer, "products", req.body.name || product.name);
        newImagePaths.push(path);
      }
    }

    // 2. Handle Existing Images (Deletion Logic)
    let keptImages = [];
    if (req.body.existingImages) {
      // Frontend sends JSON array of Full URLs: ["http://.../img1.png", ...]
      const rawExisting = typeof req.body.existingImages === 'string'
        ? JSON.parse(req.body.existingImages)
        : req.body.existingImages;

      // Convert Full URLs back to Relative Paths (stored in DB)
      // e.g., "http://localhost:5000/uploads/img.png" -> "uploads/img.png"
      keptImages = rawExisting.map(url => {
        const serverUrl = process.env.SERVER_URL; 
        return url.replace(`${serverUrl}/`, ""); 
      });
    }

    // Find images currently in DB that are NOT in the keptImages list
    const imagesToDelete = product.images.filter(img => !keptImages.includes(img));

    // Delete them from filesystem
    imagesToDelete.forEach(img => deleteImage(img));

    // 3. Combine Kept + New
    req.body.images = [...keptImages, ...newImagePaths];

    // 4. Parse other JSON fields
    if (req.body.variants && typeof req.body.variants === 'string') {
        req.body.variants = JSON.parse(req.body.variants);
    }
    if (req.body.details && typeof req.body.details === 'string') {
        req.body.details = JSON.parse(req.body.details);
    }
    
    // Slug update
    if (req.body.name) req.body.slug = slugify(req.body.name, { lower: true });

    // 5. Update DB
    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    res.status(200).json({ success: true, data: formatProduct(product) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ... other functions remain the same

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.images && product.images.length > 0) {
      product.images.forEach(img => deleteImage(img));
    }

    await product.deleteOne();
    res.status(200).json({ success: true, message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

