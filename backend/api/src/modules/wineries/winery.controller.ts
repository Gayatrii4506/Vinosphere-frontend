import { Request, Response } from 'express';
import { wineryService } from './winery.service';

export class WineryController {
  async getAllWineries(req: Request, res: Response) {
    try {
      const wineries = await wineryService.getAllWineries();
      res.status(200).json({ status: 'success', data: wineries });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async getWineryById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const winery = await wineryService.getWineryById(id);
      res.status(200).json({ status: 'success', data: winery });
    } catch (error: any) {
      res.status(404).json({ status: 'error', message: error.message });
    }
  }

  async createWinery(req: Request, res: Response) {
    try {
      const winery = await wineryService.createWinery(req.body);
      res.status(201).json({ status: 'success', data: winery });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async updateWinery(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const winery = await wineryService.updateWinery(id, req.body);
      res.status(200).json({ status: 'success', data: winery });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async deleteWinery(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await wineryService.deleteWinery(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }
}

export const wineryController = new WineryController();
