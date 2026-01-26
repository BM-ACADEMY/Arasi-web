const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

// 1. Load Environment Variables First
dotenv.config();

// 2. Connect to Database
connectDB();

const app = express();

// --- Global Middleware ---

// Security Headers
app.use(helmet());

// Logger (only in development)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// CORS Setup (Dynamic Origin from Env)
app.use(cors({
  origin: process.env.CLIENT_URL, // e.g., "http://localhost:3000"
  credentials: true,              // Allows cookies to be sent/received
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Body Parsers
app.use(express.json()); // JSON body
app.use(express.urlencoded({ extended: true })); // URL Encoded body

// Cookie Parser
app.use(cookieParser());

// --- Routes ---
// Base route to check server status
app.get("/", (req, res) => {
  res.json({ message: "API is running..." });
});

// Auth Routes
app.use("/api/auth", require("./routes/authRoutes"));

// --- Error Handling ---

// 404 Handler (Route Not Found)
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  console.error(err.stack); // Log error stack in server console

  res.status(statusCode).json({
    success: false,
    message: err.message,
    // Only show stack trace in development mode
    stack: process.env.NODE_ENV === "development" ? err.stack : null, 
  });
});

// --- Server Startup ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});