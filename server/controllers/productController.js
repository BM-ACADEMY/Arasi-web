const Product = require("../models/productModel");
const slugify = require("slugify");
const { saveImage } = require("../utils/uploadConfig");

// Helper: Format Product Images
const formatProduct = (product) => ({
  ...product._doc,
  images: product.images.map(img => `${process.env.SERVER_URL}/${img}`)
});

// @route   POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const { name, variants } = req.body;

    // 1. Process Images
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const path = await saveImage(file.buffer, "products", name);
        imagePaths.push(path);
      }
    }

    // 2. Parse Variants (if coming as string from FormData)
    let parsedVariants = variants;
    if (typeof variants === 'string') {
        parsedVariants = JSON.parse(variants);
    }

    const product = await Product.create({
      ...req.body,
      slug: slugify(name, { lower: true }),
      images: imagePaths,
      variants: parsedVariants
    });

    res.status(201).json({ success: true, data: formatProduct(product) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route   GET /api/products
exports.getAllProducts = async (req, res) => {
  try {
    const { keyword, category, subCategory } = req.query;
    let query = { isActive: true };

    // Search Logic
    if (keyword) {
      query.$text = { $search: keyword };
    }
    // Filter Logic
    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;

    const products = await Product.find(query)
      .populate("category", "name")
      .populate("subCategory", "name");

    res.status(200).json({
      success: true,
      count: products.length,
      data: products.map(formatProduct)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/products/:id (ID Search)
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

// @route   GET /api/products/slug/:slug (Slug Search)
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

// @route   PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Handle New Images (Append to existing)
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const path = await saveImage(file.buffer, "products", req.body.name || product.name);
        newImages.push(path);
      }
      // If user sends "clearImages": "true", wipe old ones. Otherwise append.
      if (req.body.clearImages === 'true') {
        req.body.images = newImages;
      } else {
        req.body.images = [...product.images, ...newImages];
      }
    }

    // Handle Variants Update
    if (req.body.variants && typeof req.body.variants === 'string') {
        req.body.variants = JSON.parse(req.body.variants);
    }

    if (req.body.name) req.body.slug = slugify(req.body.name, { lower: true });

    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    res.status(200).json({ success: true, data: formatProduct(product) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ success: true, message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
