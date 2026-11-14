import { Router } from 'express';
import { bookingController } from './booking.controller';
import { protect } from '../../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router.route('/:id')
  .get(bookingController.getBookingById)
  .put(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

export default router;
