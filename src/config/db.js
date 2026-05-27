const mongoose = require("mongoose");

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn("MONGODB_URI is missing. Database features will not work.");
    return;
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(mongoUri);

  console.log("Connected to MongoDB");
}

module.exports = connectDB;
