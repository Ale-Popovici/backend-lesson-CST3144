// controllers/order.controller.js
const Order = require("../models/order.model");
const Lesson = require("../models/lesson.model");

// Get all orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("lessonIds");
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const { lessonIds, numberOfSpace } = req.body;

    // Verify lessons exist and have enough space
    for (let lessonId of lessonIds) {
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        return res.status(404).json({
          success: false,
          error: `Lesson not found with id ${lessonId}`,
        });
      }
      if (lesson.space < numberOfSpace) {
        return res.status(400).json({
          success: false,
          error: `Not enough space in lesson ${lesson.topic}`,
        });
      }
    }

    // Create order and update lesson spaces
    const order = await Order.create(req.body);

    // Update spaces for each lesson
    for (let lessonId of lessonIds) {
      await Lesson.findByIdAndUpdate(lessonId, {
        $inc: { space: -numberOfSpace },
      });
    }

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
