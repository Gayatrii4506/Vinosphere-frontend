import { Router } from 'express';
import { wineryController } from './winery.controller';

const router = Router();

router.route('/')
  .get(wineryController.getAllWineries)
  .post(wineryController.createWinery);

router.route('/:id')
  .get(wineryController.getWineryById)
  .put(wineryController.updateWinery)
  .delete(wineryController.deleteWinery);

export default router;
