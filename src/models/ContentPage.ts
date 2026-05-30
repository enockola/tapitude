import mongoose, { Document, Schema, Model } from "mongoose";

export interface IContentPage extends Document {
  creatorId: mongoose.Types.ObjectId;
  themeId?: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  body?: string;
  buttonText?: string;
  externalLink?: string;
  embedUrl?: string;
  embedType: "none" | "youtube" | "vimeo" | "imageUrl" | "googleDrive" | "dropbox" | "externalWebsite" | "socialPost";
  status: "draft" | "scheduled" | "published";
  scheduledFor?: Date;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
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
    themeId: {
      type: Schema.Types.ObjectId,
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
    body: { type: String, trim: true },
    buttonText: { type: String, trim: true },
    externalLink: { type: String, trim: true },
    embedUrl: { type: String, trim: true },
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
    scheduledFor: { type: Date },
    publishedAt: { type: Date }
  },
  { timestamps: true }
);

const ContentPage = mongoose.model<IContentPage>("ContentPage", contentPageSchema);
export default ContentPage;