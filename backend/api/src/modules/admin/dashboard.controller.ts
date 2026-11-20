import { Request, Response } from 'express';
import { dashboardService } from './dashboard.service';
import { db } from '../../adapters/database';
import { AppError } from '../../shared/errors/AppError';

export class DashboardController {
  async getInventory(req: Request, res: Response) {
    const wineryId = req.params.wineryId as string;
    if (!wineryId) throw new AppError('wineryId is required', 400);

    const inventory = await dashboardService.getInventory(wineryId);
    res.status(200).json({ status: 'success', data: inventory });
  }

  async updateStock(req: Request, res: Response) {
    const inventoryId = req.params.inventoryId as string;
    const { quantity } = req.body;

    if (quantity === undefined) throw new AppError('quantity is required', 400);

    const user = (req as any).user;
    const role = (user?.role || user?.app_metadata?.role || '').toLowerCase();
    const userWineryId = user?.wineryId || user?.app_metadata?.winery_id || user?.user_metadata?.winery_id || user?.user_metadata?.wineryId;

    if (role !== 'admin' && role !== 'superadmin') {
      const inventory = await db.findOne('wine_inventory', { id: inventoryId });
      if (!inventory) {
        throw new AppError(`Inventory item with ID ${inventoryId} not found`, 404);
      }
      if (inventory.winery_id && inventory.winery_id !== userWineryId) {
        throw new AppError('Access denied: You are not authorized to update inventory for another winery estate.', 403);
      }
    }

    const updated = await dashboardService.updateStock(inventoryId, quantity);
    res.status(200).json({ status: 'success', data: updated });
  }

  async getAnalytics(req: Request, res: Response) {
    const wineryId = req.params.wineryId as string;
    if (!wineryId) throw new AppError('wineryId is required', 400);

    const analytics = await dashboardService.getDailyAnalytics(wineryId);
    res.status(200).json({ status: 'success', data: analytics });
  }

  async getOverview(req: Request, res: Response) {
    const wineryId = req.params.wineryId as string;
    if (!wineryId) throw new AppError('wineryId is required', 400);

    const overview = await dashboardService.getOverview(wineryId);
    res.status(200).json({ status: 'success', data: overview });
  }

  async addWine(req: Request, res: Response) {
    const wineryId = req.params.wineryId as string;
    if (!wineryId) throw new AppError('wineryId is required', 400);
    if (!req.body || !req.body.name) throw new AppError('Wine data is required', 400);

    const newWine = await dashboardService.addWine(wineryId, req.body);
    res.status(201).json({ status: 'success', data: newWine });
  }

  async updateWine(req: Request, res: Response) {
    const wineryId = req.params.wineryId as string;
    const wineId = req.params.wineId as string;
    if (!wineryId) throw new AppError('wineryId is required', 400);
    if (!wineId) throw new AppError('wineId is required', 400);
    if (!req.body) throw new AppError('Wine data is required', 400);

    const updatedWine = await dashboardService.updateWine(wineryId, wineId, req.body);
    res.status(200).json({ status: 'success', data: updatedWine });
  }

  async deleteWine(req: Request, res: Response) {
    const wineryId = req.params.wineryId as string;
    const wineId = req.params.wineId as string;
    if (!wineryId) throw new AppError('wineryId is required', 400);
    if (!wineId) throw new AppError('wineId is required', 400);

    const result = await dashboardService.deleteWine(wineryId, wineId);
    res.status(200).json({ status: 'success', message: 'Wine deleted successfully', data: result });
  }

  async addExperience(req: Request, res: Response) {
    const wineryId = req.params.wineryId as string;
    if (!wineryId) throw new AppError('wineryId is required', 400);
    if (!req.body || !req.body.name) throw new AppError('Experience data is required', 400);

    const newExp = await dashboardService.addExperience(wineryId, req.body);
    res.status(201).json({ status: 'success', data: newExp });
  }

  async addEvent(req: Request, res: Response) {
    const wineryId = req.params.wineryId as string;
    if (!wineryId) throw new AppError('wineryId is required', 400);
    if (!req.body || !req.body.name) throw new AppError('Event data is required', 400);

    const newEvent = await dashboardService.addEvent(wineryId, req.body);
    res.status(201).json({ status: 'success', data: newEvent });
  }

  async updateSettings(req: Request, res: Response) {
    const wineryId = req.params.wineryId as string;
    if (!wineryId) throw new AppError('wineryId is required', 400);
    if (!req.body) throw new AppError('Settings payload is required', 400);

    const updated = await dashboardService.updateSettings(wineryId, req.body);
    res.status(200).json({ status: 'success', data: updated });
  }
}

export const dashboardController = new DashboardController();
