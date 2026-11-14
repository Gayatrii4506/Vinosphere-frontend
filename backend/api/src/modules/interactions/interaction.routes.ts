import { Router } from 'express';
import { interactionController } from './interaction.controller';
import { protect } from '../../middleware/authMiddleware';

const router = Router();

// Record a new interaction (optional auth for guest/registered tracking)
router.post('/', interactionController.recordInteraction.bind(interactionController));

// Authenticated user interaction history
router.get('/me', protect, interactionController.getMyInteractions.bind(interactionController));
router.get('/summary', protect, interactionController.getMyInteractionSummary.bind(interactionController));
router.delete('/me', protect, interactionController.resetMyInteractions.bind(interactionController));
router.post('/reset', protect, interactionController.resetMyInteractions.bind(interactionController));

export default router;
