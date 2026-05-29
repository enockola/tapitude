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

  console.log("DATABASE: Connected to MongoDB");
}

module.exports = connectDB;
