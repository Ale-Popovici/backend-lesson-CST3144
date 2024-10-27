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

// Middleware
app.use(cors());
app.use(express.json());

// Logger middleware
app.use(logger);

// Serve static files from the public directory
app.use("/public", express.static(path.join(__dirname, "public")));

// Custom static file middleware for more control
app.use(staticFileMiddleware);

// Mount routes
app.use("/api/lessons", lessonRoutes);
app.use("/api/orders", orderRoutes);

// Create public/images directory if it doesn't exist
const publicImagesPath = path.join(__dirname, "public", "images");
require("fs").mkdirSync(publicImagesPath, { recursive: true });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Something went wrong!",
  });
});

// Start server
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Public directory: ${path.join(__dirname, "public")}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
