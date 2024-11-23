// controllers/order.controller.js
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db.config");
const { validateOrder } = require("../models/validators");

exports.createOrder = async (req, res) => {
  try {
    const { name, phoneNumber, lessonIds, numberOfSpace } = req.body;
    const db = getDB();

    // Validate input
    const errors = validateOrder({
      name,
      phoneNumber,
      lessonIds,
      numberOfSpace,
    });
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    // Convert string IDs to ObjectId
    const objectIds = lessonIds.map((id) => new ObjectId(id));

    // Check if lessons exist and have enough space
    for (let lessonId of objectIds) {
      const lesson = await db.collection("lessons").findOne({ _id: lessonId });
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
    const order = {
      name,
      phoneNumber,
      lessonIds: objectIds,
      numberOfSpace,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("orders").insertOne(order);

    // Update lesson spaces
    for (let lessonId of objectIds) {
      await db
        .collection("lessons")
        .updateOne({ _id: lessonId }, { $inc: { space: -numberOfSpace } });
    }

    res.status(201).json({
      success: true,
      data: { ...order, _id: result.insertedId },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const db = getDB();
    const orders = await db
      .collection("orders")
      .aggregate([
        {
          $lookup: {
            from: "lessons",
            localField: "lessonIds",
            foreignField: "_id",
            as: "lessons",
          },
        },
      ])
      .toArray();

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
