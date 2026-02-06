const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const SubCategory = require("../models/subCategoryModel");
const Order = require("../models/orderModel");
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

exports.getBestSellers = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $match: { orderStatus: { $ne: "Cancelled" } } },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          totalSold: { $sum: "$orderItems.quantity" }
        }
      },
      { $match: { totalSold: { $gt: 10 } } },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    const productIds = topProducts.map(item => item._id);
    const products = await Product.find({ _id: { $in: productIds } })
      .populate("category", "name")
      .populate("subCategory", "name");

    const sortedProducts = productIds
      .map(id => products.find(p => p._id.toString() === id.toString()))
      .filter(p => p !== undefined);

    res.status(200).json({ success: true, data: sortedProducts.map(formatProduct) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    // 1. FAST CHECK: Limit
    const productCount = await Product.countDocuments();
    if (productCount >= 25) {
      return res.status(400).json({ success: false, message: "Limit reached: Max 25 products allowed." });
    }

    // 2. FAST CHECK: Duplicate Name
    // Check this BEFORE uploading images to save time
    const { name, variants, details } = req.body;
    const slug = slugify(name, { lower: true });
    
    const existingProduct = await Product.exists({ slug });
    if (existingProduct) {
      return res.status(400).json({ success: false, message: `Product "${name}" already exists.` });
    }

    // 3. SPEED UP: Parallel Image Upload
    // Use Promise.all to upload all images at once instead of one by one
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => saveImage(file.buffer, "products", name));
      imagePaths = await Promise.all(uploadPromises);
    }

    let parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
    let parsedDetails = typeof details === 'string' ? JSON.parse(details) : details;

    // 4. Calculate Price & Stock for Root Level
    const rootPrice = parsedVariants.length > 0 
      ? Math.min(...parsedVariants.map(v => Number(v.price) || 0)) 
      : 0;

    const totalStock = parsedVariants.length > 0
      ? parsedVariants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)
      : 0;

    const product = await Product.create({
      ...req.body,
      slug: slug,
      images: imagePaths,
      variants: parsedVariants,
      details: parsedDetails,
      price: rootPrice,
      stock: totalStock
    });

    res.status(201).json({ success: true, data: formatProduct(product) });

  } catch (error) {
    // 5. ERROR HANDLING: Catch Duplicate Key Error Cleanly
    if (error.code === 11000) {
       return res.status(400).json({ 
         success: false, 
         message: "A product with this name already exists. Please choose a different name." 
       });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const { keyword, category, subCategory } = req.query;
    let query = { isActive: true };

    if (keyword) {
      const searchRegex = new RegExp(keyword, "i");
      // Run category lookups in parallel
      const [matchingCategories, matchingSubCategories] = await Promise.all([
        Category.find({ name: searchRegex }).select('_id'),
        SubCategory.find({ name: searchRegex }).select('_id')
      ]);

      const categoryIds = matchingCategories.map(cat => cat._id);
      const subCategoryIds = matchingSubCategories.map(sub => sub._id);

      query.$or = [
        { name: searchRegex },
        { brand: searchRegex },
        { category: { $in: categoryIds } },
        { subCategory: { $in: subCategoryIds } }
      ];
    }

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

exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Handle Image Uploads in Parallel
    let newImagePaths = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => saveImage(file.buffer, "products", req.body.name || product.name));
      newImagePaths = await Promise.all(uploadPromises);
    }

    let keptImages = [];
    if (req.body.existingImages) {
      const rawExisting = typeof req.body.existingImages === 'string'
        ? JSON.parse(req.body.existingImages)
        : req.body.existingImages;

      keptImages = rawExisting.map(url => {
        const serverUrl = process.env.SERVER_URL; 
        return url.replace(`${serverUrl}/`, ""); 
      });
    }

    // Clean up old images
    const imagesToDelete = product.images.filter(img => !keptImages.includes(img));
    imagesToDelete.forEach(img => deleteImage(img));

    req.body.images = [...keptImages, ...newImagePaths];

    if (req.body.variants && typeof req.body.variants === 'string') {
        req.body.variants = JSON.parse(req.body.variants);
    }
    if (req.body.details && typeof req.body.details === 'string') {
        req.body.details = JSON.parse(req.body.details);
    }

    // Recalculate Root Price & Stock
    if (req.body.variants) {
      req.body.price = req.body.variants.length > 0 
        ? Math.min(...req.body.variants.map(v => Number(v.price) || 0)) 
        : 0;

      req.body.stock = req.body.variants.length > 0
        ? req.body.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)
        : 0;
    }
    
    if (req.body.name) req.body.slug = slugify(req.body.name, { lower: true });

    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    res.status(200).json({ success: true, data: formatProduct(product) });

  } catch (error) {
    if (error.code === 11000) {
        return res.status(400).json({ 
          success: false, 
          message: "A product with this name already exists." 
        });
     }
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