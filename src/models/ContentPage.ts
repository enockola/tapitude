import mongoose, { Document, Schema, Model } from "mongoose";

// Type for typechecking
export interface IContentPage extends Document {
  creatorId: mongoose.Types.ObjectId;
  fileKey?: string;
  body?: string;
  status: "draft" | "scheduled" | "published";
  scheduledFor?: Date;
  scheduledTimeZone?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  viewedBy: String[];
}

// 2. Define the schema
const contentPageSchema = new Schema<IContentPage>(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    fileKey: { type: String, trim: true },
    body: { type: String, trim: true },
    status: {
      type: String,
      enum: ["draft", "scheduled", "published"],
      default: "draft",
      index: true
    },
    scheduledFor: { type: Date },
    scheduledTimeZone: {
      type: String,
      default: "America/New_York"
    },
    publishedAt: { type: Date },
    likes: { type: Number, default: 0 },
    viewedBy: { type: [String], default: [] }
  },
  { timestamps: true }
);

const ContentPage = mongoose.model<IContentPage>("ContentPage", contentPageSchema);
export default ContentPage;