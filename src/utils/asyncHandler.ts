import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * AsyncHandler is an Express middleware function that wraps a 
 * Promise-based function in a try/catch block.
 * @param fn - The Promise-based function to wrap. 
 * @returns A RequestHandler that Express can safely execute.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;