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

    // Transform lessons before sending
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

// Search lessons
const searchLessons = async (req, res) => {
  try {
    const { q } = req.query;
    console.log("Received search query:", q);

    if (!q) {
      const allLessons = await Lesson.find({});
      return res.status(200).json(allLessons);
    }

    // Create search query
    const searchConditions = {
      $or: [
        { topic: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
      ],
    };

    // Add numeric search if the query is a number
    if (!isNaN(q)) {
      const numericValue = Number(q);
      searchConditions.$or.push(
        { price: numericValue },
        { space: numericValue }
      );
    }

    console.log(
      "Search conditions:",
      JSON.stringify(searchConditions, null, 2)
    );

    const lessons = await Lesson.find(searchConditions);

    // Transform lessons before sending
    const transformedLessons = lessons.map((lesson) => ({
      _id: lesson._id,
      topic: lesson.topic,
      location: lesson.location,
      price: lesson.price,
      space: lesson.space,
    }));

    console.log(`Found ${transformedLessons.length} matching lessons`);

    res.status(200).json(transformedLessons);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      error: "Error searching lessons",
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

    // Transform lesson before sending response
    const transformedLesson = {
      _id: lesson._id,
      topic: lesson.topic,
      location: lesson.location,
      price: lesson.price,
      space: lesson.space,
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
  updateLesson,
  searchLessons,
};
