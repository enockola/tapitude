const User = require("./models/User");
const connectDB = require("./config/db");

require("dotenv").config();

async function startServer() {
    await connectDB();

    const user = await User.findOne({ email: "admin@tapitude.test" });
    console.log(user); //TODO: THe user returns null, is it connected to the database?
}

startServer().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});