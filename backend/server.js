require("dotenv").config({ path: "./config/.env" });
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db.config");
const logger = require("./middleware/logger");
const staticFileMiddleware = require("./middleware/static");
const mongoose = require("mongoose");

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
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:8080",
        "https://ale-popovici.github.io",
        "http://3.253.62.183:5001",
        "http://ec2-3-253-62-183.eu-west-1.compute.amazonaws.com:5001",
      ];

      // Allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true, // Allow cookies and credentials
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    maxAge: 86400, // Cache preflight requests for 24 hours
  })
);

// Preflight requests
app.options("*", cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger middleware
app.use(logger);

// Serve static files from the public directory
app.use("/public", express.static(path.join(__dirname, "public")));

// Custom static file middleware
app.use(staticFileMiddleware);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongodb: {
      status:
        mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
      host: mongoose.connection.host,
    },
  });
});

// API Routes
app.use("/api/lessons", lessonRoutes);
app.use("/api/orders", orderRoutes);

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
MongoDB URI: ${process.env.MONGODB_URI ? "Set" : "Not Set"}
Allowed Origins:
- http://localhost:8080
- https://ale-popovici.github.io
- http://3.253.62.183:5001
- http://ec2-3-253-62-183.eu-west-1.compute.amazonaws.com:5001

Server is ready to accept connections!
  `);
});

// Graceful shutdown handlers
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Promise Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:");
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});

process.on("SIGINT", () => {
  server.close(() => process.exit(0));
});
