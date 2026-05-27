const mongoose = require("mongoose");

const creatorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    displayName: {
      type: String,
      required: true,
      trim: true
    },
    brandName: {
      type: String,
      trim: true
    },
    bio: {
      type: String,
      trim: true
    },
    profileImageUrl: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CreatorProfile", creatorProfileSchema);
