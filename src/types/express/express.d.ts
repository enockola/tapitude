// types/express/index.d.ts
import { Request } from 'express';
import { IUser } from '../../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser
    }
  }
}