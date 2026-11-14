import { Router } from 'express';
import { discoveryController } from './discovery.controller';
import { catchAsync } from '../../shared/utils/catchAsync';

const router = Router();

// e.g. GET /api/v1/discovery/wines?q=red
router.get('/wines', catchAsync(discoveryController.getWines));

// e.g. GET /api/v1/discovery/events
router.get('/events', catchAsync(discoveryController.getEvents));

export default router;
