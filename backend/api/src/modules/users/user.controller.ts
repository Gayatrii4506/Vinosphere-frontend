import { Request, Response } from 'express';
import { userService } from './user.service';
import { cacheService } from '../../shared/cache.service';

export class UserController {
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json({ status: 'success', data: users });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const user = await userService.getUserById(req.params.id as string);
      res.status(200).json({ status: 'success', data: user });
    } catch (error: any) {
      res.status(404).json({ status: 'error', message: error.message });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json({ status: 'success', data: user });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const user = await userService.updateUser(req.params.id as string, req.body);
      res.status(200).json({ status: 'success', data: user });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async getMyPreferences(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
      }
      let preferences = cacheService.getPreferences(user.id);
      if (!preferences) {
        preferences = await userService.getPreferences(user.id, user.email);
        if (preferences) cacheService.setPreferences(user.id, preferences, 30);
      }
      res.status(200).json({ status: 'success', data: preferences });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async updateMyPreferences(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
      }
      const updated = await userService.updatePreferences(user.id, req.body, user.email);
      cacheService.invalidatePreferences(user.id);
      res.status(200).json({ status: 'success', data: updated });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      await userService.deleteUser(req.params.id as string);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }
}

export const userController = new UserController();
