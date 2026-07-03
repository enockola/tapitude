import mongoose from "mongoose";
import connectDB from "./utils/dbUtils";
import User from "./models/User";
import fs from "fs";

// 2. Your Python-like input function (Who knew doing this in js would be so difficult?)
function input(promptText: string): string {
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

        const adminEmail =  input('Enter your admin email: ');
        const plainPassword = input('Enter your admin password: ');
        const adminName = input('Enter admin name: ');

        const newAdmin = await User.createAccount({ name: adminName, email: adminEmail, password: plainPassword, role: "admin" });
        // 5. Save it to the database
        if (newAdmin !== null) {
            console.log("\n==================================================");
            console.log("  SUCCESS: Admin account created at root level!");
            console.log("==================================================");
            console.log(`ID:       ${newAdmin._id}`);
            console.log(`Name:     ${newAdmin.name}`);
            console.log(`Email:    ${newAdmin.email}`);
            console.log(`Password: ${plainPassword}`);
            console.log(`Role:     ${newAdmin.role}`);
            console.log("==================================================\n");
        }
    } catch (error) {
        console.error("Error creating admin account:", error);
    } finally {
        // Always disconnect cleanly when running one-off CLI scripts
        await mongoose.disconnect();
        process.exit(0);
    }
}

createAdminAccount();