const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const slugify = require("slugify");

// 1. Storage (Memory to allow processing)
const storage = multer.memoryStorage();

// 2. Filter (Images only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

const upload = multer({ storage, fileFilter });

/**
 * Resize, Compress & Save Image
 * Returns the relative path: "uploads/folder/filename.webp"
 */
const saveImage = async (fileBuffer, folderName, fileName) => {
  const uploadDir = path.join("public", "uploads", folderName);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const cleanFileName = slugify(fileName, { lower: true, strict: true });
  const finalFileName = `${cleanFileName}-${Date.now()}.webp`;
  const fullPath = path.join(uploadDir, finalFileName);

  await sharp(fileBuffer)
    .resize(800, 800, { fit: "inside", withoutEnlargement: true })
    .toFormat("webp")
    .webp({ quality: 80 })
    .toFile(fullPath);

  return `uploads/${folderName}/${finalFileName}`;
};

module.exports = { upload, saveImage };
