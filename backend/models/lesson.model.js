// models/lesson.model.js
const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    customId: {
      type: Number,
      required: true,
      unique: true,
    },
    topic: {
      type: String,
      required: [true, "Subject is required"],
      text: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      text: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    space: {
      type: Number,
      required: [true, "Available space is required"],
      min: [0, "Space cannot be negative"],
      default: 5,
    },
    icon: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create text index for search functionality
lessonSchema.index({
  topic: "text",
  location: "text",
});

module.exports = mongoose.model("Lesson", lessonSchema);
