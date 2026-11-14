import { Request, Response } from 'express';
import { discoveryService } from './discovery.service';

export class DiscoveryController {
  async getWines(req: Request, res: Response) {
    const { q } = req.query;
    
    let wines;
    if (q && typeof q === 'string') {
      wines = await discoveryService.searchWines(q);
    } else {
      wines = await discoveryService.discoverWines();
    }
    
    res.status(200).json({ status: 'success', data: wines });
  }

  async getEvents(req: Request, res: Response) {
    const events = await discoveryService.getUpcomingEvents();
    res.status(200).json({ status: 'success', data: events });
  }
}

export const discoveryController = new DiscoveryController();
