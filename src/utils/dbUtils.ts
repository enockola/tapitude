import "dotenv/config";
const mongoose = require("mongoose");

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;
  console.log("Attempting to connect to MongoDB...");
  if (!mongoUri) {
    console.warn("DATABASE: MONGODB_URI is missing. Database features will not work.");
    return;
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri);
  if (mongoose.connection.readyState === 1) {
    console.log("DATABASE: Connected to MongoDB");
  } else if (mongoose.connection.readyState === 2) {
    console.log("DATABASE: Reconnected to MongoDB");
  } else if (mongoose.connection.readyState === 3) {
    console.log("DATABASE: Disconnected from MongoDB");
  } else if (mongoose.connection.readyState === 4) {
    console.log("DATABASE: Failed to connect to MongoDB");
  }
}

export default connectDB;
