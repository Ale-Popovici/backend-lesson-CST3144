const { MongoClient } = require("mongodb");

let db = null;
let client = null;

const connectDB = async () => {
  try {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db("lessons"); // Specify database name explicitly
    console.log(`MongoDB Connected: ${client.options.srvHost}`);
    return db;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB first.");
  }
  return db;
};

const closeDB = async () => {
  if (client) {
    await client.close();
    db = null;
    client = null;
  }
};

module.exports = { connectDB, getDB, closeDB };
