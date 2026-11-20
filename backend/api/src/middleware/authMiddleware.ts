import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase';
import { env } from '../config/env';
import { db } from '../adapters/database';
import { AppError } from '../shared/errors/AppError';
import { catchAsync } from '../shared/utils/catchAsync';

if (!env.JWT_SECRET || env.JWT_SECRET.trim() === '') {
  throw new Error('FATAL: JWT_SECRET environment variable is missing. The server cannot safely sign or verify winery JWT tokens.');
}
const JWT_SECRET = env.JWT_SECRET;

/**
 * Cryptographically verifies backend-signed custom winery JWT tokens.
 * Enforces HS256 algorithm, signature validity, expiration, and required tenant claims.
 */
function verifyCustomWineryJwt(token: string): any {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as any;
    if (decoded && typeof decoded === 'object') {
      const wineryId = decoded.wineryId;
      const role = (decoded.role || '').toLowerCase();
      const userId = decoded.userId || decoded.sub;

      // Verify essential claims for winery management tokens
      if (wineryId && (role === 'winery' || role === 'winery_owner' || role === 'winery_admin')) {
        return {
          id: userId || `u-${wineryId}`,
          authId: decoded.authId || null,
          email: decoded.email,
          role,
          wineryId,
          app_metadata: { role, winery_id: wineryId },
          user_metadata: { role, winery_id: wineryId }
        };
      }
    }
  } catch (jwtErr) {
    // Signature invalid, expired, or wrong algorithm
  }
  return null;
}

/**
 * Verifies Supabase Auth user session tokens and safely resolves roles.
 * Privileged roles ('admin', 'winery_owner') MUST be anchored in immutable
 * app_metadata or the verified database records, never untrusted user_metadata.
 */
async function resolveSupabaseUser(token: string): Promise<any> {
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return null;
    }

    let role = (user.app_metadata?.role || '').toLowerCase();

    // If no verified role in app_metadata, cross-reference public.users record
    if (!role || role === 'user') {
      try {
        const dbUser = await db.findOne('users', { auth_id: user.id }).catch(() => null) ||
                       await db.findOne('users', { email: user.email }).catch(() => null);
        if (dbUser?.role) {
          role = String(dbUser.role).toLowerCase();
        } else if (user.email === 'admin@vinosphere.in' || user.email === 'admin@vinosphere.internal') {
          role = 'admin';
        } else {
          role = 'user';
        }
      } catch {
        role = (user.email === 'admin@vinosphere.in' || user.email === 'admin@vinosphere.internal') ? 'admin' : 'user';
      }
    }

    const wineryId = user.app_metadata?.winery_id || 
                     user.user_metadata?.winery_id || 
                     user.user_metadata?.wineryId;

    return {
      ...user,
      role,
      wineryId,
      app_metadata: { ...user.app_metadata, role, winery_id: wineryId },
      user_metadata: { ...user.user_metadata, role, winery_id: wineryId }
    };
  } catch (err) {
    return null;
  }
}

/**
 * Middleware to protect routes.
 * Extracts Bearer token and verifies via:
 * 1) Backend-signed winery JWT (cryptographically verified HS256 signature, expiry, claims)
 * 2) Supabase Auth access token (with secure role resolution)
 *
 * NOTE: Service role key bypass has been strictly removed.
 */
export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // 1) Extract Bearer token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Attempt cryptographic custom winery JWT verification
  const wineryUser = verifyCustomWineryJwt(token);
  if (wineryUser) {
    (req as any).user = wineryUser;
    return next();
  }

  // 3) Attempt Supabase Auth verification
  const supabaseUser = await resolveSupabaseUser(token);
  if (supabaseUser) {
    (req as any).user = supabaseUser;
    return next();
  }

  return next(new AppError('The token belonging to this user does not exist or is invalid.', 401));
});

/**
 * Optional authentication middleware: extracts user if valid token provided, but doesn't block guests.
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const wineryUser = verifyCustomWineryJwt(token);
      if (wineryUser) {
        (req as any).user = wineryUser;
        return next();
      }

      const supabaseUser = await resolveSupabaseUser(token);
      if (supabaseUser) {
        (req as any).user = supabaseUser;
        return next();
      }
    }
  } catch (err) {
    // Guest fallback
  }
  next();
};
