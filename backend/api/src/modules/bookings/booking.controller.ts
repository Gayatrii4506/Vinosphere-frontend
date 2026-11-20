import { Request, Response } from 'express';
import { bookingService } from './booking.service';

export class BookingController {
  async getAllBookings(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const role = (user?.role || user?.app_metadata?.role || '').toLowerCase();
      const userWineryId = user?.wineryId || user?.app_metadata?.winery_id || user?.user_metadata?.winery_id || user?.user_metadata?.wineryId;

      const filters: Record<string, any> = {};

      if (role === 'admin' || role === 'superadmin') {
        if (req.query.wineryId) filters.winery_id = String(req.query.wineryId);
        if (req.query.userId) filters.user_id = String(req.query.userId);
      } else if (['winery', 'winery_owner', 'winery_admin'].includes(role)) {
        if (!userWineryId) {
          return res.status(403).json({ status: 'error', message: 'No estate associated with this winery account' });
        }
        filters.winery_id = userWineryId;
      } else {
        // Consumer / standard account can only view their own bookings
        filters.user_id = user.id;
      }

      const bookings = await bookingService.getAllBookings(filters);
      res.status(200).json({ status: 'success', data: bookings });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async getBookingById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const booking = await bookingService.getBookingById(id);
      if (!booking) {
        return res.status(404).json({ status: 'error', message: `Booking with ID ${id} not found` });
      }

      const user = (req as any).user;
      const role = (user?.role || user?.app_metadata?.role || '').toLowerCase();
      const userWineryId = user?.wineryId || user?.app_metadata?.winery_id || user?.user_metadata?.winery_id || user?.user_metadata?.wineryId;

      if (role !== 'admin' && role !== 'superadmin') {
        if (['winery', 'winery_owner', 'winery_admin'].includes(role)) {
          if (booking.winery_id !== userWineryId) {
            return res.status(403).json({ status: 'error', message: 'Access denied: You are not authorized to view bookings for another winery estate.' });
          }
        } else {
          if (booking.user_id !== user.id) {
            return res.status(403).json({ status: 'error', message: 'Access denied: You are not authorized to view this booking.' });
          }
        }
      }

      res.status(200).json({ status: 'success', data: booking });
    } catch (error: any) {
      res.status(404).json({ status: 'error', message: error.message });
    }
  }

  async createBooking(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const bookingData = {
        ...req.body,
        user_id: user.id
      };
      const booking = await bookingService.createBooking(bookingData);
      res.status(201).json({ status: 'success', data: booking });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async updateBooking(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const booking = await bookingService.getBookingById(id);
      if (!booking) {
        return res.status(404).json({ status: 'error', message: `Booking with ID ${id} not found` });
      }

      const user = (req as any).user;
      const role = (user?.role || user?.app_metadata?.role || '').toLowerCase();
      const userWineryId = user?.wineryId || user?.app_metadata?.winery_id || user?.user_metadata?.winery_id || user?.user_metadata?.wineryId;

      if (role !== 'admin' && role !== 'superadmin') {
        if (['winery', 'winery_owner', 'winery_admin'].includes(role)) {
          if (booking.winery_id !== userWineryId) {
            return res.status(403).json({ status: 'error', message: 'Access denied: You are not authorized to update bookings for another winery estate.' });
          }
        } else {
          if (booking.user_id !== user.id) {
            return res.status(403).json({ status: 'error', message: 'Access denied: You are not authorized to update this booking.' });
          }
        }
      }

      // Prevent reassigning winery_id or user_id
      delete req.body.winery_id;
      delete req.body.user_id;

      const updated = await bookingService.updateBooking(id, req.body);
      res.status(200).json({ status: 'success', data: updated });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async deleteBooking(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const booking = await bookingService.getBookingById(id);
      if (!booking) {
        return res.status(404).json({ status: 'error', message: `Booking with ID ${id} not found` });
      }

      const user = (req as any).user;
      const role = (user?.role || user?.app_metadata?.role || '').toLowerCase();
      const userWineryId = user?.wineryId || user?.app_metadata?.winery_id || user?.user_metadata?.winery_id || user?.user_metadata?.wineryId;

      if (role !== 'admin' && role !== 'superadmin') {
        if (['winery', 'winery_owner', 'winery_admin'].includes(role)) {
          if (booking.winery_id !== userWineryId) {
            return res.status(403).json({ status: 'error', message: 'Access denied: You are not authorized to cancel bookings for another winery estate.' });
          }
        } else {
          if (booking.user_id !== user.id) {
            return res.status(403).json({ status: 'error', message: 'Access denied: You are not authorized to cancel this booking.' });
          }
        }
      }

      await bookingService.deleteBooking(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }
}

export const bookingController = new BookingController();
