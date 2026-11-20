import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/AppError';

/**
 * Role-Based Access Control (RBAC) Middleware.
 * Must be called AFTER the `protect` middleware.
 * 
 * @param roles Array of allowed roles (e.g. ['admin', 'winery'])
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return next(new AppError('Authentication required to access this resource', 401));
    }

    const rawRole = (user.role || user.app_metadata?.role || user.user_metadata?.role || 'user').toLowerCase();

    // Standardize role synonyms:
    // admin: 'admin', 'superadmin'
    // winery: 'winery', 'winery_owner', 'winery_admin'
    const normalizedRoles = roles.map(r => r.toLowerCase());
    
    const isAllowed = normalizedRoles.some(allowedRole => {
      if (allowedRole === 'admin' && (rawRole === 'admin' || rawRole === 'superadmin')) {
        return true;
      }
      if (allowedRole === 'winery' && (rawRole === 'winery' || rawRole === 'winery_owner' || rawRole === 'winery_admin')) {
        return true;
      }
      return rawRole === allowedRole;
    });

    if (!isAllowed) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};

/**
 * Winery-Level Data Isolation Middleware.
 * Enforces strict multi-tenant isolation across winery estates:
 * - Superadmins ('admin', 'superadmin') can access and manage any winery.
 * - Winery managers ('winery_owner', 'winery_admin') can ONLY mutate/access data
 *   associated with their assigned estate (`wineryId`).
 * - Cross-winery tampering attempts are strictly blocked with 403 Forbidden.
 */
export const requireWineryIsolation = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (!user) {
    return next(new AppError('Authentication required', 401));
  }

  const rawRole = (user.role || user.app_metadata?.role || user.user_metadata?.role || 'user').toLowerCase();

  // Superadmins have unrestricted estate oversight
  if (rawRole === 'admin' || rawRole === 'superadmin') {
    return next();
  }

  // Must have winery privileges
  if (!['winery', 'winery_owner', 'winery_admin'].includes(rawRole)) {
    return next(new AppError('Access denied: Winery privileges required', 403));
  }

  const userWineryId = 
    user.wineryId || 
    user.app_metadata?.winery_id ||
    user.user_metadata?.winery_id || 
    user.user_metadata?.wineryId ||
    user.winery_id;

  if (!userWineryId) {
    return next(new AppError('Access denied: No winery estate linked to this account', 403));
  }

  // Extract the target winery ID from wineryId param, query, or request body
  const targetWineryId = 
    req.params?.wineryId || 
    req.body?.winery_id || 
    req.body?.wineryId ||
    req.query?.wineryId ||
    req.query?.winery_id;

  const normalize = (val: any) => String(val).trim().toLowerCase();

  if (targetWineryId) {
    if (normalize(targetWineryId) !== normalize(userWineryId)) {
      return next(
        new AppError(
          'Access denied: You are not authorized to access or mutate records for another winery estate.',
          403
        )
      );
    }
  }

  // For mutating requests, ensure tenant estate cannot be spoofed in body
  if (req.body && typeof req.body === 'object') {
    if (req.body.winery_id && normalize(req.body.winery_id) !== normalize(userWineryId)) {
      return next(
        new AppError(
          'Access denied: Cannot mutate records on behalf of another winery estate.',
          403
        )
      );
    }
    if (req.body.wineryId && normalize(req.body.wineryId) !== normalize(userWineryId)) {
      return next(
        new AppError(
          'Access denied: Cannot mutate records on behalf of another winery estate.',
          403
        )
      );
    }
    req.body.winery_id = userWineryId;
  }

  next();
};
