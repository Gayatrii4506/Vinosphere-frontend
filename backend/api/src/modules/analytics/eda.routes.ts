/**
 * VinoSphere EDA Routes
 * =====================
 * Mounts EDA endpoints under /api/v1/analytics/eda
 * Uses existing route patterns from analytics.routes.ts
 */

import { Router } from 'express';
import { edaController } from './eda.controller';
import { protect } from '../../middleware/authMiddleware';
import { restrictTo, requireWineryIsolation } from '../../middleware/roleMiddleware';

const router = Router();

// EDA Overview — summary + data quality assessment
router.get('/overview/:wineryId', protect, restrictTo('admin', 'winery'), requireWineryIsolation, edaController.getOverview);

// Wine Distribution Analysis — type, variety, price, alcohol, etc.
router.get('/wine-distribution/:wineryId', protect, restrictTo('admin', 'winery'), requireWineryIsolation, edaController.getWineDistribution);

// Price vs Engagement scatter data
router.get('/price-engagement/:wineryId', protect, restrictTo('admin', 'winery'), requireWineryIsolation, edaController.getPriceEngagement);

// Aggregate Engagement Funnel
router.get('/conversion-funnel/:wineryId', protect, restrictTo('admin', 'winery'), requireWineryIsolation, edaController.getConversionFunnel);

// Seasonality / Time Analysis
router.get('/seasonality/:wineryId', protect, restrictTo('admin', 'winery'), requireWineryIsolation, edaController.getSeasonality);

// Booking Analysis — breakdown by event/experience
router.get('/booking-analysis/:wineryId', protect, restrictTo('admin', 'winery'), requireWineryIsolation, edaController.getBookingAnalysis);

// Wine Quality EDA — from grape quality dataset (admin or winery manager)
router.get('/quality-analysis', protect, restrictTo('admin', 'winery'), edaController.getQualityAnalysis);

// Correlation Matrix — quality dataset + winery engagement
router.get('/correlation/:wineryId', protect, restrictTo('admin', 'winery'), requireWineryIsolation, edaController.getCorrelation);

export default router;
