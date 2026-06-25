import mongoose from "mongoose";
import crypto from "crypto";

//for typechecking

export interface ICreatorProfile {
  userId: mongoose.Types.ObjectId;
  creatorSlug?: string;
  displayName: string;
  brandName?: string;
  brandColor?: string;
  bio?: string;
  profileImageKey?: string;
  createdAt?: Date;
  updatedAt?: Date;
  totalViews?: number;
  totalLikes?: number;
}

interface ICreatorModel extends mongoose.Model<ICreatorProfile> {
}


const creatorProfileSchema = new mongoose.Schema<ICreatorProfile>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    creatorSlug: {
      type: String,
      required: false,
      unique: true,
      trim: true
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
    },
    totalViews: {
      type: Number,
      default: 0
    },
    totalLikes: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Generate creatorSlug before saving
creatorProfileSchema.pre('save', function (next) {
  if (!this.creatorSlug && this.userId) {
    // Generate slug from userId (or any other logic you prefer)
    const hash = crypto.createHash('md5').update(this.userId.toString()).digest('hex');
    this.creatorSlug = hash.substring(0, 24);
  }
  next();
});

const CreatorProfile = mongoose.model<ICreatorProfile, ICreatorModel>("CreatorProfile", creatorProfileSchema);

export default CreatorProfile;