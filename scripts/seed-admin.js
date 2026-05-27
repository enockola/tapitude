require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../src/models/User");

async function seedAdmin() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing.");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const name = process.env.SEED_ADMIN_NAME || "Admin User";
  const email = (process.env.SEED_ADMIN_EMAIL || "admin@tapitude.test").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";

  const existingAdmin = await User.findOne({ email });

  if (existingAdmin) {
    console.log(`Admin already exists: ${email}`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await User.create({
    name,
    email,
    passwordHash,
    role: "admin",
    status: "active"
  });

  console.log(`Seeded admin account: ${email}`);

  await mongoose.disconnect();
}

seedAdmin().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
