import { Router } from 'express';
import { qualityController } from './quality.controller';

const router = Router();

router.post('/predict', (req, res) => qualityController.predict(req, res));
router.get('/benchmarks', (req, res) => qualityController.getBenchmarks(req, res));

export default router;
