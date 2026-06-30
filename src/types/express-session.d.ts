import 'express-session';
import { IUser } from "../models/User";

declare module 'express-session' {
  interface SessionData {
    userId: string;
    // user: IUser;
  }
}