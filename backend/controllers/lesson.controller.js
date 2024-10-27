// controllers/lesson.controller.js
const Lesson = require("../models/lesson.model");

// Get all lessons
const getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find(
      {},
      {
        topic: 1,
        location: 1,
        price: 1,
        space: 1,
        _id: 1,
      }
    );

    res.status(200).json(lessons);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error fetching lessons",
    });
  }
};

// Update lesson
const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate the updates
    if (updates.space != null && updates.space < 0) {
      return res.status(400).json({
        success: false,
        error: "Space cannot be negative",
      });
    }

    const lesson = await Lesson.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: "Lesson not found",
      });
    }

    res.status(200).json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getLessons,
  updateLesson,
};
