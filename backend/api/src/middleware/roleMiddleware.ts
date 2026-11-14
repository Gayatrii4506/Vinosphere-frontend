import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/AppError';

/**
 * Role-Based Access Control (RBAC) Middleware.
 * Must be called AFTER the `protect` middleware.
 * 
 * @param roles Array of allowed roles (e.g. ['admin', 'winery_owner'])
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    // Supabase stores custom claims/roles usually in user_metadata or app_metadata
    const userRole = user?.app_metadata?.role || user?.user_metadata?.role || 'user';

    if (!roles.includes(userRole)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};
