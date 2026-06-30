import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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

userSchema.methods.changePassword = async function (newPassword: string) {
  const saltRounds = 20;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  this.passwordHash = hashedPassword;
  return await this.save();
};

userSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.passwordHash);
};

const User = mongoose.model<any, UserModel>("User", userSchema);
export default User;