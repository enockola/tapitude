import mongoose, { Document, Schema, Model } from "mongoose";

export interface IFile extends Document {
  fileKey: string;
  originalName: string;
  contentType: string;
  fileSize: number;
  ownerId: Schema.Types.ObjectId;
  createdAt: Date;
  isActive: boolean;
}

const FileSchema = new Schema<IFile>({
  fileKey: { type: String, required: true, index: true },
  originalName: { type: String, required: true },
  contentType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});


export const FileModel = mongoose.model<IFile>("File", FileSchema);
export default FileModel;