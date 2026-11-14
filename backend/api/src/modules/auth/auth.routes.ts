import { Router } from 'express';
import { authController } from './auth.controller';

const router = Router();

// Winery onboarding self-serve registration (pending status)
router.post('/register', (req, res) => authController.registerWinery(req, res));

// Winery authentication login
router.post('/login', (req, res) => authController.loginWinery(req, res));

// Superadmin verification & approval endpoints
router.get('/admin/pending', (req, res) => authController.getPendingWineries(req, res));
router.post('/admin/approve/:wineryId', (req, res) => authController.approveWinery(req, res));
router.post('/admin/reject/:wineryId', (req, res) => authController.rejectWinery(req, res));

export default router;
