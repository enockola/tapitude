import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { logger } from "../utils/loggingUtils";

// The user model is where we determine the mongoose schema to ensure rigid data structure
// We also define helper methods to allow us to easily interact with the accounts in the database

// We define these to tell typescript what methods we have
interface IUserMethods {
  disableAccount(): Promise<Document>;
  enableAccount(): Promise<Document>;
  changePassword(newPassword: string): Promise<Document>;
  comparePassword(password: string): Promise<boolean>;
}
interface UserModel extends mongoose.Model<any, {}, IUserMethods> {
  createAccount(userData: CreateUserData): Promise<any>;
}

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "creator";
  status: "active" | "disabled";
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
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

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: "admin" | "creator";
  status?: "active" | "disabled";
}
userSchema.statics.findByEmail = async function (email: string) {
  const self = this as any;
  return await self.findOne({ email: email.toLowerCase().trim() });
}

userSchema.statics.createAccount = async function (userData: CreateUserData) {
  // Use 'this' normally. To make TS happy inside the function, cast 'this' to any or UserModel
  const self = this as any;

  const isExistingAccount = await self.findOne({ email: userData.email.toLowerCase().trim() });
  if (isExistingAccount) {
    throw new Error("An account with this email already exists.");
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

  // Use 'this' as a constructor safely
  const newUser = new self({
    name: userData.name,
    email: userData.email,
    passwordHash: hashedPassword,
    role: userData.role,
    status: userData.status === undefined ? "active" : userData.status
  });

  await newUser.save();
  return newUser;
};



userSchema.methods.disableAccount = async function () {
  this.status = "disabled";
  return await this.save();
};

userSchema.methods.enableAccount = async function () {
  this.status = "active";
  return await this.save();
};

/**
 * 
 * @param newPassword 
 * @returns if the password is changed
 */
userSchema.methods.changePassword = async function (newPassword: string) {
  const self = this as any;
  logger.info(`Changing password for user: ${self.email}`);
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    self.passwordHash = hashedPassword;
    logger.info(`Finished hashing password for user: ${self.email}`);
    return await self.save();
  }
  catch (error) {
    logger.error(error, "Error changing password:");
  } return false;
};

userSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.passwordHash);
};



export const getPasswordValidationError = (password: string): string | null => {
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return "Password must be at least 8 characters long and contain uppercase, lowercase, and a number.";
  }

  return null; // Passed validation!
};


const User = mongoose.model<any, UserModel>("User", userSchema);
export default User;
