// routes/lesson.routes.js
const express = require("express");
const router = express.Router();
const lessonController = require("../controllers/lesson.controller");

// GET all lessons
router.get("/", lessonController.getLessons);

// GET search lessons
router.get("/search", lessonController.searchLessons);

// PUT update lesson
router.put("/:id", lessonController.updateLesson);

module.exports = router;
