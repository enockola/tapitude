// types/express/index.d.ts
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string; // Add other properties your user object has
        // email: string;
      };
    }
  }
}