const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");
const readline = require('readline');
const fs = require('fs');

// 2. Your Python-like input function (Who knew doing this in js would be so difficult?)
function input(promptText) {
    process.stdout.write(promptText);
    // 2. Allocate a buffer to hold the typed text (up to 1000 characters)
    const buffer = Buffer.alloc(1000);

    // 3. Force the OS to block/pause right here until Enter is pressed
    const bytesRead = fs.readSync(0, buffer, 0, 1000, null);
    return buffer.toString('utf8', 0, bytesRead).trim();
}


require("dotenv").config();

async function createAdminAccount() {
    try {
        // 1. Connect to the database
        await connectDB();

        const adminEmail = await input('Enter your admin email: ');
        const plainPassword = await input('Enter your admin password: ');
        const adminName = await input('Enter admin name: ');

        // 2. Check if an individual admin document already exists at the root level
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log(`An admin with the email ${adminEmail} already exists at the root level.`);
            process.exit(0);
        }

        // 3. Hash the password before saving
        console.log("Hashing password...");
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

        // 4. Create the new admin document matching your schema layout
        const newAdmin = new User({
            name: "Tapitude Admin",
            email: adminEmail,
            passwordHash: hashedPassword,
            role: "admin",
            status: "active"
        });

        // 5. Save it to the database
        await newAdmin.save();

        console.log("\n==========================================");
        console.log("  SUCCESS: Admin account created at root level!");
        console.log("==========================================");
        console.log(`ID:       ${newAdmin._id}`);
        console.log(`Name:     ${newAdmin.name}`);
        console.log(`Email:    ${newAdmin.email}`);
        console.log(`Password: ${plainPassword}`);
        console.log(`Role:     ${newAdmin.role}`);
        console.log("==========================================\n");

    } catch (error) {
        console.error("Error creating admin account:", error);
    } finally {
        // Always disconnect cleanly when running one-off CLI scripts
        await mongoose.disconnect();
        process.exit(0);
    }
}

createAdminAccount();