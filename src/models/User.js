const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["admin", "creator"],
      default: "creator"
    },
    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
