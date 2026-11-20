import { Request, Response, NextFunction } from 'express';

/**
 * Wraps async controller functions to catch unhandled promise rejections
 * and automatically pass them to our Global Error Handler via `next(err)`.
 * This eliminates the need for try/catch blocks in every controller.
 */
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return fn(req, res, next).catch(next);
  };
};
