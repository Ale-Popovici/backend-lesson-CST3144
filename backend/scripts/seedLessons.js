// scripts/seedLessons.js
const { MongoClient } = require("mongodb");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../config/.env") });

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
  let client;
  try {
    console.log("Attempting to connect to MongoDB...");

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db();

    // Clear existing lessons
    await db.collection("lessons").deleteMany({});
    console.log("Cleared existing lessons");

    // Insert lessons
    await db.collection("lessons").insertMany(lessons);
    console.log("Added sample lessons");

    // Create indexes
    await db
      .collection("lessons")
      .createIndex({ topic: "text", location: "text" });
    console.log("Created text indexes");

    console.log("Seed completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
    process.exit(0);
  }
};

seedDatabase();
