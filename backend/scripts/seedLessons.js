const { MongoClient } = require("mongodb");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../config/.env") });

const lessons = [
  {
    topic: "Mathematics",
    location: "H101",
    price: 50,
    space: 5,
  },
  {
    topic: "Physics",
    location: "A203",
    price: 60,
    space: 5,
  },
  {
    topic: "Chemistry",
    location: "C205",
    price: 55,
    space: 5,
  },
  {
    topic: "Biology",
    location: "B301",
    price: 45,
    space: 5,
  },
  {
    topic: "Computer Science",
    location: "F405",
    price: 65,
    space: 5,
  },
  {
    topic: "English Literature",
    location: "A102",
    price: 40,
    space: 5,
  },
  {
    topic: "History",
    location: "D204",
    price: 45,
    space: 5,
  },
  {
    topic: "Geography",
    location: "A303",
    price: 50,
    space: 5,
  },
  {
    topic: "Art",
    location: "C401",
    price: 55,
    space: 5,
  },
  {
    topic: "Music",
    location: "F100",
    price: 60,
    space: 5,
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

    const db = client.db("lessons"); // Specify database name

    // Drop existing collections
    await db
      .collection("lessons")
      .drop()
      .catch(() => console.log("No lessons collection to drop"));
    await db
      .collection("orders")
      .drop()
      .catch(() => console.log("No orders collection to drop"));
    console.log("Cleared existing collections");

    // Create collections
    await db.createCollection("lessons");
    await db.createCollection("orders");
    console.log("Created collections");

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
