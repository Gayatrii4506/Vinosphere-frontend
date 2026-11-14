/**
 * VinoSphere EDA Routes
 * =====================
 * Mounts EDA endpoints under /api/v1/analytics/eda
 * Uses existing route patterns from analytics.routes.ts
 */

import { Router } from 'express';
import { edaController } from './eda.controller';

const router = Router();

// EDA Overview — summary + data quality assessment
router.get('/overview/:wineryId', edaController.getOverview);

// Wine Distribution Analysis — type, variety, price, alcohol, etc.
router.get('/wine-distribution/:wineryId', edaController.getWineDistribution);

// Price vs Engagement scatter data
router.get('/price-engagement/:wineryId', edaController.getPriceEngagement);

// Aggregate Engagement Funnel
router.get('/conversion-funnel/:wineryId', edaController.getConversionFunnel);

// Seasonality / Time Analysis
router.get('/seasonality/:wineryId', edaController.getSeasonality);

// Booking Analysis — breakdown by event/experience
router.get('/booking-analysis/:wineryId', edaController.getBookingAnalysis);

// Wine Quality EDA — from grape quality dataset
router.get('/quality-analysis', edaController.getQualityAnalysis);

// Correlation Matrix — quality dataset + winery engagement
router.get('/correlation/:wineryId', edaController.getCorrelation);

export default router;
