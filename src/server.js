const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 3000;
const useMockData = process.env.USE_MOCK_DATA === "true";

async function startServer() {
  if (useMockData) {
    console.log("Running in frontend/mock mode. MongoDB connection skipped.");
  } else {
    await connectDB();
  }

  app.listen(PORT, () => {
    console.log(`Tapitude Creator Hub running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
