// controllers/lesson.controller.js
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db.config");
const { validateLesson } = require("../models/validators");

const getLessons = async (req, res) => {
  try {
    const db = getDB();
    const lessons = await db
      .collection("lessons")
      .find({})
      .project({ topic: 1, location: 1, price: 1, space: 1 })
      .toArray();

    const transformedLessons = lessons.map((lesson) => ({
      _id: lesson._id,
      topic: lesson.topic,
      location: lesson.location,
      price: lesson.price,
      space: lesson.space,
    }));

    res.status(200).json(transformedLessons);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching lessons",
    });
  }
};

const searchLessons = async (req, res) => {
  try {
    const { q } = req.query;
    const db = getDB();

    if (!q) {
      return getLessons(req, res);
    }

    const searchConditions = {
      $or: [
        { topic: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
      ],
    };

    if (!isNaN(q)) {
      const numericValue = Number(q);
      searchConditions.$or.push(
        { price: numericValue },
        { space: numericValue }
      );
    }

    const lessons = await db
      .collection("lessons")
      .find(searchConditions)
      .toArray();

    const transformedLessons = lessons.map((lesson) => ({
      _id: lesson._id,
      topic: lesson.topic,
      location: lesson.location,
      price: lesson.price,
      space: lesson.space,
    }));

    res.status(200).json(transformedLessons);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      error: "Error searching lessons",
    });
  }
};

const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db = getDB();

    // Validate updates
    if (updates.space != null) {
      const validationErrors = validateLesson({
        ...updates,
        space: updates.space,
      });
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          errors: validationErrors,
        });
      }
    }

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid lesson ID format",
      });
    }

    const result = await db.collection("lessons").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      {
        returnDocument: "after",
      }
    );

    if (!result.value) {
      return res.status(404).json({
        success: false,
        error: "Lesson not found",
      });
    }

    const transformedLesson = {
      _id: result.value._id,
      topic: result.value.topic,
      location: result.value.location,
      price: result.value.price,
      space: result.value.space,
    };

    res.status(200).json({
      success: true,
      data: transformedLesson,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getLessons,
  searchLessons,
  updateLesson,
};

// controllers/order.controller.js
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db.config");
const { validateOrder } = require("../models/validators");

const createOrder = async (req, res) => {
  try {
    const { name, phoneNumber, lessonIds, numberOfSpace } = req.body;
    const db = getDB();

    // Use the validator
    const validationErrors = validateOrder({
      name,
      phoneNumber,
      lessonIds,
      numberOfSpace,
    });
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: validationErrors,
      });
    }

    // Convert string IDs to ObjectId and validate them
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
      phoneNumber,
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
    res.status(500).json({
      success: false,
      error: "Error fetching orders",
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
};
