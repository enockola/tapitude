const mongoose = require("mongoose");

const contentPageSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    themeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theme"
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    body: {
      type: String,
      trim: true
    },
    buttonText: {
      type: String,
      trim: true
    },
    externalLink: {
      type: String,
      trim: true
    },
    embedUrl: {
      type: String,
      trim: true
    },
    embedType: {
      type: String,
      enum: ["none", "youtube", "vimeo", "imageUrl", "googleDrive", "dropbox", "externalWebsite", "socialPost"],
      default: "none"
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "published"],
      default: "draft",
      index: true
    },
    scheduledFor: {
      type: Date
    },
    publishedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContentPage", contentPageSchema);
