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

// CORS configuration with your GitHub Pages URL
app.use(
  cors({
    origin: [
      "http://localhost:8080",
      "https://ale-popovici.github.io",
      "https://ale-popovici.github.io/CST3145/",
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
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger middleware
app.use(logger);

// Serve static files from the public directory
app.use("/public", express.static(path.join(__dirname, "public")));

// Custom static file middleware for more control
app.use(staticFileMiddleware);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Mount routes
app.use("/api/lessons", lessonRoutes);
app.use("/api/orders", orderRoutes);

// Create public/images directory if it doesn't exist
const publicImagesPath = path.join(__dirname, "public", "images");
require("fs").mkdirSync(publicImagesPath, { recursive: true });

// Generic error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Log specific error details
  console.error({
    message: err.message,
    path: req.path,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString(),
  });

  res.status(err.status || 500).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Something went wrong!"
        : err.message,
  });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Start server
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Public directory: ${path.join(__dirname, "public")}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log("Allowed origins:", [
    "http://localhost:8080",
    "https://ale-popovici.github.io",
    "https://ale-popovici.github.io/CST3145/",
  ]);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  server.close(() => process.exit(1));
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated.");
    process.exit(0);
  });
});
