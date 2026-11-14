import { Request, Response } from 'express';
import { bookingService } from './booking.service';

export class BookingController {
  async getAllBookings(req: Request, res: Response) {
    try {
      const bookings = await bookingService.getAllBookings();
      res.status(200).json({ status: 'success', data: bookings });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async getBookingById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const booking = await bookingService.getBookingById(id);
      res.status(200).json({ status: 'success', data: booking });
    } catch (error: any) {
      res.status(404).json({ status: 'error', message: error.message });
    }
  }

  async createBooking(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const bookingData = {
        ...req.body,
        user_id: userId
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
      const booking = await bookingService.updateBooking(id, req.body);
      res.status(200).json({ status: 'success', data: booking });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async deleteBooking(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await bookingService.deleteBooking(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }
}

export const bookingController = new BookingController();
