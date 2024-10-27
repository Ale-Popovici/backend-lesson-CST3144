// controllers/lesson.controller.js
const Lesson = require("../models/lesson.model");

// Get all lessons
exports.getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find();
    res.status(200).json({
      success: true,
      count: lessons.length,
      data: lessons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Create new lesson
exports.createLesson = async (req, res) => {
  try {
    const lesson = await Lesson.create(req.body);
    res.status(201).json({
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

// Search lessons
exports.searchLessons = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: "Search query is required",
      });
    }

    const possiblePrice = parseFloat(q);

    const searchConditions = {
      $or: [
        { $text: { $search: q } },
        ...(possiblePrice
          ? [{ price: possiblePrice }, { space: possiblePrice }]
          : []),
        { topic: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
      ],
    };

    const lessons = await Lesson.find(searchConditions);

    res.status(200).json({
      success: true,
      count: lessons.length,
      data: lessons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Update lesson space
exports.updateLessonSpace = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { space: req.body.space },
      { new: true, runValidators: true }
    );

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
