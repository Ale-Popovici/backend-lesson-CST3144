// models/order.model.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      match: [/^[A-Za-z\s]+$/, "Name must contain only letters"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[0-9]+$/, "Phone number must contain only numbers"],
    },
    lessonIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
        required: true,
      },
    ],
    numberOfSpace: {
      type: Number,
      required: [true, "Number of spaces is required"],
      min: [1, "Must book at least one space"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
