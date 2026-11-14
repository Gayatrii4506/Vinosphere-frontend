import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../shared/errors/AppError';
import { catchAsync } from '../shared/utils/catchAsync';

/**
 * Middleware to protect routes.
 * Extracts the Bearer token from the Authorization header and verifies it via Supabase.
 */
export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // 1) Check if the token exists in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verify token via Supabase Auth
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return next(new AppError('The token belonging to this user does not exist or is invalid.', 401));
  }

  // 3) Attach the user object to the request so subsequent controllers can access it
  // We extend the Request type locally to avoid TypeScript errors
  (req as any).user = user;

  next();
});

/**
 * Optional authentication middleware: extracts user if token provided, but doesn't block guests.
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user) {
        (req as any).user = user;
      }
    }
  } catch (err) {
    // Guest fallback
  }
  next();
};
