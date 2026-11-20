import { Request, Response } from 'express';
import { eventService } from './event.service';

export class EventController {
  async getAllEvents(req: Request, res: Response) {
    try {
      const events = await eventService.getAllEvents();
      res.status(200).json({ status: 'success', data: events });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async getEventById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const event = await eventService.getEventById(id);
      res.status(200).json({ status: 'success', data: event });
    } catch (error: any) {
      res.status(404).json({ status: 'error', message: error.message });
    }
  }

  async createEvent(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const role = (user?.role || user?.app_metadata?.role || '').toLowerCase();
      const userWineryId = user?.wineryId || user?.app_metadata?.winery_id || user?.user_metadata?.winery_id || user?.user_metadata?.wineryId;

      if (role !== 'admin' && role !== 'superadmin') {
        if (!userWineryId) {
          return res.status(403).json({ status: 'error', message: 'No estate associated with this winery account' });
        }
        req.body.winery_id = userWineryId;
      }

      const event = await eventService.createEvent(req.body);
      res.status(201).json({ status: 'success', data: event });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async updateEvent(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const existing = await eventService.getEventById(id);
      if (!existing) {
        return res.status(404).json({ status: 'error', message: `Event with ID ${id} not found` });
      }

      const user = (req as any).user;
      const role = (user?.role || user?.app_metadata?.role || '').toLowerCase();
      const userWineryId = user?.wineryId || user?.app_metadata?.winery_id || user?.user_metadata?.winery_id || user?.user_metadata?.wineryId;

      if (role !== 'admin' && role !== 'superadmin') {
        if (existing.winery_id !== userWineryId) {
          return res.status(403).json({ status: 'error', message: 'Access denied: You are not authorized to update another winery estate\'s event.' });
        }
        delete req.body.winery_id;
      }

      const event = await eventService.updateEvent(id, req.body);
      res.status(200).json({ status: 'success', data: event });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async deleteEvent(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const existing = await eventService.getEventById(id);
      if (!existing) {
        return res.status(404).json({ status: 'error', message: `Event with ID ${id} not found` });
      }

      const user = (req as any).user;
      const role = (user?.role || user?.app_metadata?.role || '').toLowerCase();
      const userWineryId = user?.wineryId || user?.app_metadata?.winery_id || user?.user_metadata?.winery_id || user?.user_metadata?.wineryId;

      if (role !== 'admin' && role !== 'superadmin') {
        if (existing.winery_id !== userWineryId) {
          return res.status(403).json({ status: 'error', message: 'Access denied: You are not authorized to delete another winery estate\'s event.' });
        }
      }

      await eventService.deleteEvent(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }
}

export const eventController = new EventController();
