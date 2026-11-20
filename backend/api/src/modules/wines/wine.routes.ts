import { Router } from 'express';
import { wineController } from './wine.controller';
import { protect, optionalAuth } from '../../middleware/authMiddleware';
import { restrictTo, requireWineryIsolation } from '../../middleware/roleMiddleware';

const router = Router();

// Recommendation endpoints
router.get('/popular', wineController.getPopularWines);
router.get('/recommendations', wineController.getRecommendations);
router.post('/recommendations', wineController.getRecommendations);
router.get('/recommendations/engine', optionalAuth, wineController.recommendUserWines);
router.post('/recommendations/engine', optionalAuth, wineController.recommendUserWines);
router.get('/recommendations/user/:userId', wineController.recommendUserWines);
router.get('/:id/similar', wineController.getSimilarWines);

// Wine Interaction Endpoint
router.post('/:wineId/interactions', optionalAuth, wineController.recordWineInteraction);

router.route('/')
  .get(optionalAuth, wineController.getAllWines)
  .post(protect, restrictTo('admin', 'winery'), requireWineryIsolation, wineController.createWine);

router.route('/:id')
  .get(wineController.getWineById)
  .put(protect, restrictTo('admin', 'winery'), requireWineryIsolation, wineController.updateWine)
  .delete(protect, restrictTo('admin', 'winery'), requireWineryIsolation, wineController.deleteWine);

export default router;
