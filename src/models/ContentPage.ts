import mongoose, { Document, Schema, Model } from "mongoose";

// Type for typechecking
export interface IContentPage extends Document {
  creatorId: mongoose.Types.ObjectId;
  fileKey?: string;
  body?: string;
  publishDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  viewedBy: String[];
  isPublished(): boolean;
  isScheduled(): boolean;
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
    publishDate: { type: Date },
    likes: { type: Number, default: 0 },
    viewedBy: { type: [String], default: [] }
  },
  { timestamps: true }
);

contentPageSchema.methods.isPublished = function () {
  return this.publishDate < new Date();
}

contentPageSchema.methods.isScheduled = function () {
  return this.publishDate > new Date();
}

const ContentPage = mongoose.model<IContentPage>("ContentPage", contentPageSchema);
export default ContentPage;