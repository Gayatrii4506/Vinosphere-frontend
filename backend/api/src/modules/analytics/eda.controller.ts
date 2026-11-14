/**
 * VinoSphere EDA Controller
 * =========================
 * Handles HTTP requests for EDA endpoints.
 * Reuses existing controller patterns from analytics.controller.ts.
 */

import { Request, Response } from 'express';
import { EDAService } from './eda.service';

const edaService = new EDAService();

export class EDAController {

  async getOverview(req: Request, res: Response) {
    try {
      const wineryId = String(req.params.wineryId || '');
      if (!wineryId) return res.status(400).json({ status: 'error', message: 'wineryId is required' });
      const data = await edaService.getOverview(wineryId);
      res.json({ status: 'success', data });
    } catch (error: any) {
      console.error('EDA Overview error:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async getWineDistribution(req: Request, res: Response) {
    try {
      const wineryId = String(req.params.wineryId || '');
      if (!wineryId) return res.status(400).json({ status: 'error', message: 'wineryId is required' });
      const data = await edaService.getWineDistribution(wineryId);
      res.json({ status: 'success', data });
    } catch (error: any) {
      console.error('EDA Wine Distribution error:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async getPriceEngagement(req: Request, res: Response) {
    try {
      const wineryId = String(req.params.wineryId || '');
      if (!wineryId) return res.status(400).json({ status: 'error', message: 'wineryId is required' });
      const data = await edaService.getPriceEngagement(wineryId);
      res.json({ status: 'success', data });
    } catch (error: any) {
      console.error('EDA Price Engagement error:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async getConversionFunnel(req: Request, res: Response) {
    try {
      const wineryId = String(req.params.wineryId || '');
      if (!wineryId) return res.status(400).json({ status: 'error', message: 'wineryId is required' });
      const data = await edaService.getConversionFunnel(wineryId);
      res.json({ status: 'success', data });
    } catch (error: any) {
      console.error('EDA Conversion Funnel error:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async getSeasonality(req: Request, res: Response) {
    try {
      const wineryId = String(req.params.wineryId || '');
      if (!wineryId) return res.status(400).json({ status: 'error', message: 'wineryId is required' });
      const data = await edaService.getSeasonality(wineryId);
      res.json({ status: 'success', data });
    } catch (error: any) {
      console.error('EDA Seasonality error:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async getBookingAnalysis(req: Request, res: Response) {
    try {
      const wineryId = String(req.params.wineryId || '');
      if (!wineryId) return res.status(400).json({ status: 'error', message: 'wineryId is required' });
      const data = await edaService.getBookingAnalysis(wineryId);
      res.json({ status: 'success', data });
    } catch (error: any) {
      console.error('EDA Booking Analysis error:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async getQualityAnalysis(req: Request, res: Response) {
    try {
      const data = await edaService.getQualityAnalysis();
      res.json({ status: 'success', data });
    } catch (error: any) {
      console.error('EDA Quality Analysis error:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async getCorrelation(req: Request, res: Response) {
    try {
      const wineryId = String(req.params.wineryId || '');
      if (!wineryId) return res.status(400).json({ status: 'error', message: 'wineryId is required' });
      const data = await edaService.getCorrelation(wineryId);
      res.json({ status: 'success', data });
    } catch (error: any) {
      console.error('EDA Correlation error:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
}

export const edaController = new EDAController();
