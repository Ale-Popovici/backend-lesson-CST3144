const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db.config");

const createOrder = async (req, res) => {
  try {
    const { name, phone, phoneNumber, lessonIds, numberOfSpace } = req.body;
    const actualPhoneNumber = phoneNumber || phone;
    const db = getDB();

    // Validate input
    if (!name || !actualPhoneNumber || !lessonIds || !numberOfSpace) {
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
    if (!/^\d+$/.test(actualPhoneNumber)) {
      return res.status(400).json({
        success: false,
        error: "Phone number must contain only numbers",
      });
    }

    // Convert string IDs to ObjectId
    const objectIds = lessonIds.map((id) => {
      if (!ObjectId.isValid(id)) {
        throw new Error(`Invalid lesson ID format: ${id}`);
      }
      return new ObjectId(id);
    });

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
      phoneNumber: actualPhoneNumber,
      lessonIds: objectIds,
      numberOfSpace,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("orders").insertOne(order);

    // Update lesson spaces
    for (let lessonId of objectIds) {
      const updateResult = await db
        .collection("lessons")
        .updateOne({ _id: lessonId }, { $inc: { space: -numberOfSpace } });

      if (updateResult.matchedCount === 0) {
        console.error(`Failed to update lesson ${lessonId}`);
      }
    }

    res.status(201).json({
      success: true,
      data: { ...order, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const getOrders = async (req, res) => {
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
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching orders",
    });
  }
};

// Get single order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid order ID format",
      });
    }

    const order = await db
      .collection("orders")
      .aggregate([
        {
          $match: { _id: new ObjectId(id) },
        },
        {
          $lookup: {
            from: "lessons",
            localField: "lessonIds",
            foreignField: "_id",
            as: "lessons",
          },
        },
      ])
      .next();

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching order",
    });
  }
};

// Delete order
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid order ID format",
      });
    }

    // First get the order to know how many spaces to restore
    const order = await db
      .collection("orders")
      .findOne({ _id: new ObjectId(id) });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Restore spaces to lessons
    for (let lessonId of order.lessonIds) {
      await db
        .collection("lessons")
        .updateOne({ _id: lessonId }, { $inc: { space: order.numberOfSpace } });
    }

    // Delete the order
    const result = await db
      .collection("orders")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({
      success: false,
      error: "Error deleting order",
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  deleteOrder,
};
