import mongoose from "mongoose";

export interface ICreatorProfile {
  userId: mongoose.Types.ObjectId;
  displayName: string;
  brandName?: string; 
  brandColor?: string;
  bio?: string;
  profileImageKey?: string; 
  createdAt?: Date;
  updatedAt?: Date;
}

const creatorProfileSchema = new mongoose.Schema<ICreatorProfile>(
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
    brandColor: {
      type: String,
      trim: true
    },
    bio: {
      type: String,
      trim: true
    },
    profileImageKey: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

const CreatorProfile = mongoose.model<ICreatorProfile>("CreatorProfile", creatorProfileSchema);

export default CreatorProfile;