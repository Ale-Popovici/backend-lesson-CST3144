// scripts/seedLessons.js
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../config/.env") });
const mongoose = require("mongoose");
const Lesson = require("../models/lesson.model");

const lessons = [
  {
    id: 1,
    subject: "Mathematics",
    location: "H101",
    price: 50,
    spaces: 5,
  },
  {
    id: 2,
    subject: "Physics",
    location: "A203",
    price: 60,
    spaces: 5,
  },
  {
    id: 3,
    subject: "Chemistry",
    location: "C205",
    price: 55,
    spaces: 5,
  },
  {
    id: 4,
    subject: "Biology",
    location: "B301",
    price: 45,
    spaces: 5,
  },
  {
    id: 5,
    subject: "Computer Science",
    location: "F405",
    price: 65,
    spaces: 5,
  },
  {
    id: 6,
    subject: "English Literature",
    location: "A102",
    price: 40,
    spaces: 5,
  },
  {
    id: 7,
    subject: "History",
    location: "D204",
    price: 45,
    spaces: 5,
  },
  {
    id: 8,
    subject: "Geography",
    location: "A303",
    price: 50,
    spaces: 5,
  },
  {
    id: 9,
    subject: "Art",
    location: "C401",
    price: 55,
    spaces: 5,
  },
  {
    id: 10,
    subject: "Music",
    location: "F100",
    price: 60,
    spaces: 5,
  },
];

const seedDatabase = async () => {
  try {
    // Log the MongoDB URI (without sensitive information)
    console.log("Attempting to connect to MongoDB...");

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing lessons
    await Lesson.deleteMany({});
    console.log("Cleared existing lessons");

    // Transform lessons to match schema
    const transformedLessons = lessons.map((lesson) => ({
      customId: lesson.id,
      topic: lesson.subject,
      location: lesson.location,
      price: lesson.price,
      space: lesson.spaces,
    }));

    // Insert transformed lessons
    await Lesson.insertMany(transformedLessons);
    console.log("Added sample lessons");

    console.log("Seed completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
