const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const connectDB = require("./config/db");

// 1. Config
dotenv.config();
connectDB();

const app = express();

// 2. Middleware
app.use(helmet({ crossOriginResourcePolicy: false })); // Allow loading images across origins
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

if (process.env.NODE_ENV === "production") {
  app.use(morgan("dev"));
}

// 3. Static Files (CRITICAL FOR IMAGES)
// This makes http://localhost:5000/uploads/... accessible
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// 4. Routes
app.get("/", (req, res) => res.send("API Running..."));
app.use("/api/auth", require("./routes/authRoutes")); // Your existing auth
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/subcategories", require("./routes/subCategoryRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"))
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/address", require("./routes/addressRoutes"));
app.use("/api/banner", require("./routes/bannerRoutes"));


// 5. Error Handling
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(err.stack);
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? err.stack : null,
  });
});

// 6. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
