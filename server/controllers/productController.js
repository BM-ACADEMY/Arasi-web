const Product = require("../models/productModel");
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
    const { name, variants, details } = req.body; // Get details

    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const path = await saveImage(file.buffer, "products", name);
        imagePaths.push(path);
      }
    }

    // Parse JSON fields (variants & details)
    let parsedVariants = variants;
    if (typeof variants === 'string') parsedVariants = JSON.parse(variants);

    let parsedDetails = details;
    if (typeof details === 'string') parsedDetails = JSON.parse(details);

    const product = await Product.create({
      ...req.body,
      slug: slugify(name, { lower: true }),
      images: imagePaths,
      variants: parsedVariants,
      details: parsedDetails // Save details
    });

    res.status(201).json({ success: true, data: formatProduct(product) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// controllers/productController.js

exports.getAllProducts = async (req, res) => {
  try {
    const { keyword, category, subCategory } = req.query;
    let query = { isActive: true };

    // --- UPDATED SEARCH LOGIC ---
    if (keyword) {
      // Use Regex for partial match (letter-by-letter)
      // "i" flag makes it case-insensitive
      query.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { brand: { $regex: keyword, $options: "i" } },
        // Optional: Search in subCategory if needed, but requires lookup in simple queries
      ];
    }
    // ---------------------------

    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;

    const products = await Product.find(query)
      .populate("category", "name")
      .populate("subCategory", "name")
      .sort({ createdAt: -1 });

    // Format the image URLs before sending
    const formatProduct = (product) => ({
      ...product._doc,
      images: product.images.map(img => `${process.env.SERVER_URL}/${img}`)
    });

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
    const product = await Product.findById(req.params.id).populate("category", "name").populate("subCategory", "name");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ success: true, data: formatProduct(product) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate("category", "name").populate("subCategory", "name");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ success: true, data: formatProduct(product) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const path = await saveImage(file.buffer, "products", req.body.name || product.name);
        newImages.push(path);
      }
      if (req.body.clearImages === 'true') {
        product.images.forEach(img => deleteImage(img));
        req.body.images = newImages;
      } else {
        req.body.images = [...product.images, ...newImages];
      }
    }

    if (req.body.variants && typeof req.body.variants === 'string') {
        req.body.variants = JSON.parse(req.body.variants);
    }

    // Parse Details Update
    if (req.body.details && typeof req.body.details === 'string') {
        req.body.details = JSON.parse(req.body.details);
    }

    if (req.body.name) req.body.slug = slugify(req.body.name, { lower: true });

    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    res.status(200).json({ success: true, data: formatProduct(product) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

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
