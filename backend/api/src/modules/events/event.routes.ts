import { Router } from 'express';
import { eventController } from './event.controller';

const router = Router();

router.route('/')
  .get(eventController.getAllEvents)
  .post(eventController.createEvent);

router.route('/:id')
  .get(eventController.getEventById)
  .put(eventController.updateEvent)
  .delete(eventController.deleteEvent);

export default router;
