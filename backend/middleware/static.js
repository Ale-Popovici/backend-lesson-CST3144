// middleware/static.js
const path = require("path");
const fs = require("fs").promises;

const staticFileMiddleware = async (req, res, next) => {
  // Remove 'public' from the URL as it's already our static directory
  const requestedPath = req.url.replace("/public", "");

  // Only handle requests to /images/*
  if (!requestedPath.startsWith("/images/")) {
    return next();
  }

  try {
    // Get the absolute path to the image
    const imagePath = path.join(__dirname, "../public", requestedPath);
    console.log("Attempting to access:", imagePath); // Debug log

    // Check if file exists
    await fs.access(imagePath);

    // Get file extension
    const ext = path.extname(imagePath).toLowerCase();

    // Set content type based on file extension
    const contentTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
    };

    if (contentTypes[ext]) {
      res.set("Content-Type", contentTypes[ext]);
      const file = await fs.readFile(imagePath);
      return res.send(file);
    }

    throw new Error("Invalid file type");
  } catch (error) {
    console.error("Static middleware error:", error); // Debug log
    if (error.code === "ENOENT") {
      return res.status(404).json({
        success: false,
        error: "Image not found",
      });
    } else {
      return res.status(400).json({
        success: false,
        error: "Invalid image request",
      });
    }
  }
};

module.exports = staticFileMiddleware;
