import { Router } from 'express';
import { eventController } from './event.controller';
import { protect } from '../../middleware/authMiddleware';
import { restrictTo } from '../../middleware/roleMiddleware';

const router = Router();

router.route('/')
  .get(eventController.getAllEvents)
  .post(protect, restrictTo('admin', 'winery'), eventController.createEvent);

router.route('/:id')
  .get(eventController.getEventById)
  .put(protect, restrictTo('admin', 'winery'), eventController.updateEvent)
  .delete(protect, restrictTo('admin', 'winery'), eventController.deleteEvent);

export default router;
