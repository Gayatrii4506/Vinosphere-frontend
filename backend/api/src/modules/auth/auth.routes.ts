import { Router } from 'express';
import { authController } from './auth.controller';
import { protect } from '../../middleware/authMiddleware';
import { restrictTo } from '../../middleware/roleMiddleware';

const router = Router();

// Winery onboarding self-serve registration (pending status)
router.post('/register', (req, res) => authController.registerWinery(req, res));

// Winery authentication login
router.post('/login', (req, res) => authController.loginWinery(req, res));

// Superadmin verification & approval endpoints (protected, admin only)
router.get('/admin/pending', protect, restrictTo('admin'), (req, res) => authController.getPendingWineries(req, res));
router.post('/admin/approve/:wineryId', protect, restrictTo('admin'), (req, res) => authController.approveWinery(req, res));
router.post('/admin/reject/:wineryId', protect, restrictTo('admin'), (req, res) => authController.rejectWinery(req, res));

export default router;
