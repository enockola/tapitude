import "dotenv/config";
const mongoose = require("mongoose");
import { logger } from './loggingUtils.js';

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;
  logger.info("Attempting to connect to MongoDB...");
  if (!mongoUri) {
    logger.warn("DATABASE: MONGODB_URI is missing. Database features will not work.");
    return;
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri);
  if (mongoose.connection.readyState === 1) {
    logger.info("DATABASE: Connected to MongoDB");
  } else if (mongoose.connection.readyState === 2) {
    logger.warn("DATABASE: Reconnected to MongoDB");
  } else if (mongoose.connection.readyState === 3) {
    logger.warn("DATABASE: Disconnected from MongoDB");
  } else if (mongoose.connection.readyState === 4) {
    logger.warn("DATABASE: Failed to connect to MongoDB");
  }
}

export default connectDB;
