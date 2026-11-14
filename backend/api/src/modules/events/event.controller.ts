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
      const event = await eventService.createEvent(req.body);
      res.status(201).json({ status: 'success', data: event });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async updateEvent(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const event = await eventService.updateEvent(id, req.body);
      res.status(200).json({ status: 'success', data: event });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async deleteEvent(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await eventService.deleteEvent(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }
}

export const eventController = new EventController();
