import { Router } from 'express';
import { wineController } from './wine.controller';
import { optionalAuth } from '../../middleware/authMiddleware';

const router = Router();

// Recommendation endpoints
router.get('/popular', wineController.getPopularWines);
router.get('/recommendations', wineController.getRecommendations);
router.post('/recommendations', wineController.getRecommendations);
router.get('/recommendations/engine', optionalAuth, wineController.recommendUserWines);
router.post('/recommendations/engine', optionalAuth, wineController.recommendUserWines);
router.get('/recommendations/user/:userId', wineController.recommendUserWines);
router.get('/:id/similar', wineController.getSimilarWines);

// Wine Interaction Endpoint (Phase 17 Requirement 5)
router.post('/:wineId/interactions', optionalAuth, wineController.recordWineInteraction);

router.route('/')
  .get(optionalAuth, wineController.getAllWines)
  .post(wineController.createWine);

router.route('/:id')
  .get(wineController.getWineById)
  .put(wineController.updateWine)
  .delete(wineController.deleteWine);

export default router;
