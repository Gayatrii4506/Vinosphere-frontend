import { Request, Response } from 'express';
import { authService } from './auth.service';

export class AuthController {
  /**
   * POST /api/v1/auth/register
   * Onboard and register a new estate winery (sets status to 'pending')
   */
  async registerWinery(req: Request, res: Response) {
    try {
      const result = await authService.registerWinery(req.body);
      res.status(201).json({
        status: 'success',
        message: result.message,
        data: result
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 400;
      res.status(statusCode).json({
        status: 'error',
        message: error.message || 'Failed to register winery'
      });
    }
  }

  /**
   * POST /api/v1/auth/login
   * Login for winery manager / estate owner (guards against pending approval)
   */
  async loginWinery(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email) {
        return res.status(400).json({
          status: 'error',
          message: 'Email or winery identifier is required'
        });
      }

      const result = await authService.loginWinery(email, password);
      res.status(200).json({
        status: 'success',
        message: 'Authenticated successfully',
        data: result
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 401;
      res.status(statusCode).json({
        status: 'error',
        message: error.message || 'Authentication failed'
      });
    }
  }

  /**
   * GET /api/v1/auth/admin/pending
   * Superadmin: Get list of wineries pending approval
   */
  async getPendingWineries(req: Request, res: Response) {
    try {
      const pending = await authService.getPendingWineries();
      res.status(200).json({
        status: 'success',
        data: pending
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to fetch pending wineries'
      });
    }
  }

  /**
   * POST /api/v1/auth/admin/approve/:wineryId
   * Superadmin: Approve winery, activate profile, and email credentials
   */
  async approveWinery(req: Request, res: Response) {
    try {
      const wineryId = String(req.params.wineryId);
      const result = await authService.approveWinery(wineryId);
      res.status(200).json({
        status: 'success',
        message: result.message,
        data: result.winery
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        status: 'error',
        message: error.message || 'Failed to approve winery'
      });
    }
  }

  /**
   * POST /api/v1/auth/admin/reject/:wineryId
   * Superadmin: Reject winery registration
   */
  async rejectWinery(req: Request, res: Response) {
    try {
      const wineryId = String(req.params.wineryId);
      const { reason } = req.body || {};
      const result = await authService.rejectWinery(wineryId, reason);
      res.status(200).json({
        status: 'success',
        message: result.message,
        data: result.winery
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        status: 'error',
        message: error.message || 'Failed to reject winery'
      });
    }
  }
}

export const authController = new AuthController();
