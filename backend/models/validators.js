// models/validators.js
const validateLesson = (lesson) => {
  const errors = [];

  if (!lesson.customId || typeof lesson.customId !== "number") {
    errors.push("Custom ID is required and must be a number");
  }

  if (!lesson.topic || typeof lesson.topic !== "string") {
    errors.push("Topic is required and must be a string");
  }

  if (!lesson.location || typeof lesson.location !== "string") {
    errors.push("Location is required and must be a string");
  }

  if (!lesson.price || typeof lesson.price !== "number" || lesson.price < 0) {
    errors.push("Price is required and must be a non-negative number");
  }

  if (typeof lesson.space !== "number" || lesson.space < 0) {
    errors.push("Space must be a non-negative number");
  }

  return errors;
};

const validateOrder = (order) => {
  const errors = [];

  if (
    !order.name ||
    typeof order.name !== "string" ||
    !/^[A-Za-z\s]+$/.test(order.name)
  ) {
    errors.push("Name is required and must contain only letters");
  }

  if (!order.phoneNumber || !/^\d+$/.test(order.phoneNumber)) {
    errors.push("Phone number is required and must contain only numbers");
  }

  if (!Array.isArray(order.lessonIds) || order.lessonIds.length === 0) {
    errors.push("At least one lesson ID is required");
  }

  if (!order.numberOfSpace || order.numberOfSpace < 1) {
    errors.push("Number of spaces must be at least 1");
  }

  return errors;
};

module.exports = { validateLesson, validateOrder };
