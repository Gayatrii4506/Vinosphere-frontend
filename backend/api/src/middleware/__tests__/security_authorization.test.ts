import * as jwt from 'jsonwebtoken';
import { restrictTo, requireWineryIsolation } from '../roleMiddleware';
import { protect } from '../authMiddleware';
import { env } from '../../config/env';

const JWT_SECRET = env.JWT_SECRET;

describe('Security & Authorization Test Suite', () => {

  describe('1. Role-Based Access Control (restrictTo)', () => {
    it('should reject request when no authenticated user is present (401)', () => {
      const req: any = {};
      const res: any = {};
      const next = jest.fn();

      restrictTo('admin')(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });

    it('should allow admin user to access admin-only endpoint', () => {
      const req: any = { user: { id: 'admin-1', role: 'admin' } };
      const res: any = {};
      const next = jest.fn();

      restrictTo('admin')(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('should block regular user from admin endpoint (403)', () => {
      const req: any = { user: { id: 'user-1', role: 'user' } };
      const res: any = {};
      const next = jest.fn();

      restrictTo('admin')(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    });

    it('should block winery manager from admin-only endpoint (403)', () => {
      const req: any = { user: { id: 'w-1', role: 'winery_owner', wineryId: 'winery-123' } };
      const res: any = {};
      const next = jest.fn();

      restrictTo('admin')(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    });

    it('should allow winery manager to access winery endpoint', () => {
      const req: any = { user: { id: 'w-1', role: 'winery_owner', wineryId: 'winery-123' } };
      const res: any = {};
      const next = jest.fn();

      restrictTo('admin', 'winery')(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('2. Multi-Tenant Winery Isolation (requireWineryIsolation)', () => {
    const wineryA = '00000000-0000-4000-a000-000000000001';
    const wineryB = '00000000-0000-4000-b000-000000000002';

    it('should allow superadmin unrestricted access across any winery estate', () => {
      const req: any = {
        user: { id: 'admin-1', role: 'admin' },
        params: { wineryId: wineryB }
      };
      const res: any = {};
      const next = jest.fn();

      requireWineryIsolation(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('should allow winery manager access to their own estate records', () => {
      const req: any = {
        user: { id: 'manager-a', role: 'winery_owner', wineryId: wineryA },
        params: { wineryId: wineryA }
      };
      const res: any = {};
      const next = jest.fn();

      requireWineryIsolation(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('should BLOCK winery manager from accessing another estate data (403 IDOR prevention)', () => {
      const req: any = {
        user: { id: 'manager-a', role: 'winery_owner', wineryId: wineryA },
        params: { wineryId: wineryB }
      };
      const res: any = {};
      const next = jest.fn();

      requireWineryIsolation(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: expect.stringContaining('Access denied: You are not authorized to access or mutate records for another winery estate')
        })
      );
    });

    it('should BLOCK winery manager from mutating records with cross-winery ID in body', () => {
      const req: any = {
        user: { id: 'manager-a', role: 'winery_owner', wineryId: wineryA },
        body: { winery_id: wineryB, title: 'Infiltrated Event' }
      };
      const res: any = {};
      const next = jest.fn();

      requireWineryIsolation(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: expect.stringContaining('Access denied:')
        })
      );
    });

    it('should automatically bind winery_id to user estate on valid mutations', () => {
      const req: any = {
        user: { id: 'manager-a', role: 'winery_owner', wineryId: wineryA },
        body: { title: 'Authentic Estate Wine' }
      };
      const res: any = {};
      const next = jest.fn();

      requireWineryIsolation(req, res, next);
      expect(next).toHaveBeenCalledWith();
      expect(req.body.winery_id).toBe(wineryA);
    });
  });

  describe('3. Cryptographic JWT Verification & Service Role Rejection', () => {
    it('should reject requests without authorization header (401)', async () => {
      const req: any = { headers: {} };
      const res: any = {};
      const next = jest.fn();

      await protect(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });

    it('should REJECT SUPABASE_SERVICE_ROLE_KEY when supplied as Bearer token', async () => {
      const req: any = {
        headers: {
          authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
        }
      };
      const res: any = {};
      const next = jest.fn();

      await protect(req, res, next);
      // Service role key is not a valid user token and cannot bypass auth
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
      expect(req.user).toBeUndefined();
    });

    it('should accept cryptographically valid HS256 custom winery JWT', async () => {
      const validToken = jwt.sign(
        {
          userId: 'user-winery-1',
          wineryId: 'winery-uuid-1',
          role: 'winery_owner',
          email: 'estate@sula.com'
        },
        JWT_SECRET,
        { algorithm: 'HS256', expiresIn: '1h' }
      );

      const req: any = {
        headers: { authorization: `Bearer ${validToken}` }
      };
      const res: any = {};
      const next = jest.fn();

      await protect(req, res, next);
      expect(next).toHaveBeenCalledWith();
      expect(req.user).toBeDefined();
      expect(req.user.wineryId).toBe('winery-uuid-1');
      expect(req.user.role).toBe('winery_owner');
    });

    it('should REJECT winery JWT with forged signature', async () => {
      const forgedToken = jwt.sign(
        {
          userId: 'hacker-1',
          wineryId: 'winery-uuid-1',
          role: 'winery_owner'
        },
        'wrong-forged-secret-key',
        { algorithm: 'HS256', expiresIn: '1h' }
      );

      const req: any = {
        headers: { authorization: `Bearer ${forgedToken}` }
      };
      const res: any = {};
      const next = jest.fn();

      await protect(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });

    it('should REJECT expired winery JWT', async () => {
      const expiredToken = jwt.sign(
        {
          userId: 'user-winery-1',
          wineryId: 'winery-uuid-1',
          role: 'winery_owner'
        },
        JWT_SECRET,
        { algorithm: 'HS256', expiresIn: '-10s' }
      );

      const req: any = {
        headers: { authorization: `Bearer ${expiredToken}` }
      };
      const res: any = {};
      const next = jest.fn();

      await protect(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });

    it('should REJECT winery JWT missing wineryId claim', async () => {
      const incompleteToken = jwt.sign(
        {
          userId: 'user-winery-1',
          role: 'winery_owner'
          // missing wineryId
        },
        JWT_SECRET,
        { algorithm: 'HS256', expiresIn: '1h' }
      );

      const req: any = {
        headers: { authorization: `Bearer ${incompleteToken}` }
      };
      const res: any = {};
      const next = jest.fn();

      await protect(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });

    it('should confirm JWT_SECRET is configured and at least 16 chars', () => {
      expect(JWT_SECRET).toBeDefined();
      expect(typeof JWT_SECRET).toBe('string');
      expect(JWT_SECRET.length).toBeGreaterThanOrEqual(16);
    });
  });

  describe('4. M1 Defense-in-Depth & M2 Isolation Tests', () => {
    it('M1: requireWineryIsolation should reject PUT/DELETE with mismatched winery_id in body', () => {
      const req: any = {
        user: { id: 'w-1', role: 'winery_owner', wineryId: 'winery-sula' },
        params: { id: 'wine-123' },
        body: { winery_id: 'winery-grover', name: 'Tampered Vintage' }
      };
      const res: any = {};
      const next = jest.fn();

      requireWineryIsolation(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    });

    it('M2: requireWineryIsolation should reject recommendations POST with mismatched wineryId in body', () => {
      const req: any = {
        user: { id: 'w-1', role: 'winery_owner', wineryId: 'winery-sula' },
        params: {},
        body: { wineryId: 'winery-grover' }
      };
      const res: any = {};
      const next = jest.fn();

      requireWineryIsolation(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    });

    it('M2: requireWineryIsolation should allow recommendations POST when wineryId matches', () => {
      const req: any = {
        user: { id: 'w-1', role: 'winery_owner', wineryId: 'winery-sula' },
        params: {},
        body: { wineryId: 'winery-sula' }
      };
      const res: any = {};
      const next = jest.fn();

      requireWineryIsolation(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });
  });
});
