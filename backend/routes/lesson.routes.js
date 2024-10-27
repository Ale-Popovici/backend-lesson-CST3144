// routes/lesson.routes.js
const express = require("express");
const router = express.Router();
const {
  getLessons,
  createLesson,
  searchLessons,
  updateLessonSpace,
} = require("../controllers/lesson.controller");

router.route("/").get(getLessons).post(createLesson);

router.get("/search", searchLessons);
router.patch("/:id/space", updateLessonSpace);

module.exports = router;
