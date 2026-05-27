const mongoose = require("mongoose");

const themeSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    name: {
      type: String,
      default: "Default Theme",
      trim: true
    },
    fontFamily: {
      type: String,
      default: "system-ui"
    },
    primaryColor: {
      type: String,
      default: "#1f2937"
    },
    backgroundColor: {
      type: String,
      default: "#f7f4ef"
    },
    buttonColor: {
      type: String,
      default: "#1f2937"
    },
    layout: {
      type: String,
      enum: ["simple", "card", "feature"],
      default: "simple"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Theme", themeSchema);
