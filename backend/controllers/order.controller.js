// controllers/order.controller.js
const Order = require("../models/order.model");
const Lesson = require("../models/lesson.model");

// POST /orders - Create new order
exports.createOrder = async (req, res) => {
  try {
    const { lessonIds, numberOfSpace, name, phoneNumber } = req.body;

    // Validate input
    if (!name || !phoneNumber || !lessonIds || !numberOfSpace) {
      return res.status(400).json({
        success: false,
        error: "Please provide all required fields",
      });
    }

    // Validate name format (letters only)
    if (!/^[A-Za-z\s]+$/.test(name)) {
      return res.status(400).json({
        success: false,
        error: "Name must contain only letters",
      });
    }

    // Validate phone number format (numbers only)
    if (!/^\d+$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        error: "Phone number must contain only numbers",
      });
    }

    // Check if lessons exist and have enough space
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

    // Create order
    const order = await Order.create({
      name,
      phoneNumber,
      lessonIds,
      numberOfSpace,
    });

    // Update lesson spaces
    for (let lessonId of lessonIds) {
      const lesson = await Lesson.findById(lessonId);
      await Lesson.findByIdAndUpdate(
        lessonId,
        { space: lesson.space - numberOfSpace },
        { new: true }
      );
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

// GET /orders - Get all orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("lessonIds");
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error fetching orders",
    });
  }
};
