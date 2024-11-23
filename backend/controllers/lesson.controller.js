const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db.config");

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

// In controllers/lesson.controller.js
const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db = getDB();

    if (updates.space != null && updates.space < 0) {
      return res.status(400).json({
        success: false,
        error: "Space cannot be negative",
      });
    }

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid lesson ID format",
      });
    }

    // First find the lesson
    const lesson = await db
      .collection("lessons")
      .findOne({ _id: new ObjectId(id) });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: "Lesson not found",
      });
    }

    // Then update it
    const result = await db
      .collection("lessons")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updates },
        { returnDocument: "after" }
      );

    if (!result) {
      return res.status(500).json({
        success: false,
        error: "Update failed",
      });
    }

    const transformedLesson = {
      _id: result._id,
      topic: result.topic,
      location: result.location,
      price: result.price,
      space: result.space,
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
