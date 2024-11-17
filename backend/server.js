// server.js
require("dotenv").config({ path: "./config/.env" });
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db.config");
const logger = require("./middleware/logger");
const staticFileMiddleware = require("./middleware/static");

// Import routes
const lessonRoutes = require("./routes/lesson.routes");
const orderRoutes = require("./routes/order.routes");

// Initialize express
const app = express();

// Connect to MongoDB
connectDB();

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:8080",
      "https://ale-popovici.github.io",
      "https://ale-popovici.github.io/Frontend-CST3144",
      "https://ale-popovici.github.io/Frontend-CST3144/",
      "http://3.253.62.183:5001",
      "http://ec2-3-253-62-183.eu-west-1.compute.amazonaws.com:5001",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    credentials: true,
    maxAge: 86400, // 24 hours
    exposedHeaders: ["Content-Range", "X-Content-Range"],
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add security headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "DENY");
  res.header("X-XSS-Protection", "1; mode=block");
  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Logger middleware
app.use(logger);

// Serve static files from the public directory
app.use("/public", express.static(path.join(__dirname, "public")));

// Custom static file middleware
app.use(staticFileMiddleware);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    mongodb:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

// API Routes
app.use("/api/lessons", lessonRoutes);
app.use("/api/orders", orderRoutes);

// Create public/images directory
const publicImagesPath = path.join(__dirname, "public", "images");
require("fs").mkdirSync(publicImagesPath, { recursive: true });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error({
    timestamp: new Date().toISOString(),
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    ip: req.ip,
  });

  res.status(err.status || 500).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Something went wrong!"
        : err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.path,
    method: req.method,
  });
});

// Start server
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`
Server Information:
------------------
Port: ${PORT}
Environment: ${process.env.NODE_ENV}
Public Directory: ${path.join(__dirname, "public")}
Allowed Origins:
- http://localhost:8080
- https://ale-popovici.github.io
- https://ale-popovici.github.io/Frontend-CST3144
- https://ale-popovici.github.io/Frontend-CST3144/
- http://3.253.62.183:5001
- http://ec2-3-253-62-183.eu-west-1.compute.amazonaws.com:5001

MongoDB URI: ${process.env.MONGODB_URI ? "Set" : "Not Set"}
Server is ready to accept connections!
  `);
});

// Error Handlers
process.on("unhandledRejection", (err) => {
  console.log(`Unhandled Promise Rejection: ${err.message}`);
  console.error(err);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:");
  console.error(err);
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated.");
    process.exit(0);
  });
});

// Handle SIGINT (Ctrl+C)
process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated.");
    process.exit(0);
  });
});
