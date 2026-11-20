import { Router } from 'express';
import { wineryController } from './winery.controller';
import { protect, optionalAuth } from '../../middleware/authMiddleware';
import { restrictTo, requireWineryIsolation } from '../../middleware/roleMiddleware';

const router = Router();

router.route('/')
  .get(wineryController.getAllWineries)
  .post(protect, restrictTo('admin'), wineryController.createWinery);

router.route('/:id')
  .get(wineryController.getWineryById)
  .put(protect, restrictTo('admin', 'winery'), requireWineryIsolation, wineryController.updateWinery)
  .delete(protect, restrictTo('admin'), wineryController.deleteWinery);

export default router;
