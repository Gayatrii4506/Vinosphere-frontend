import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { protect } from '../../middleware/authMiddleware';
import { restrictTo, requireWineryIsolation } from '../../middleware/roleMiddleware';
import edaRoutes from './eda.routes';

const router = Router();

// EDA (Exploratory Data Analysis) sub-routes
router.use('/eda', edaRoutes);

// Track an event (public or authenticated)
router.post('/track', analyticsController.trackEvent);

// Admin-only operations
router.post('/seed-sula', protect, restrictTo('admin'), analyticsController.seedSulaAnalytics);
router.get('/admin', protect, restrictTo('admin'), analyticsController.getAdminAnalytics);

// Winery-isolated analytics endpoints (admin or isolated winery manager)
router.get('/winery/:wineryId', protect, restrictTo('admin', 'winery'), requireWineryIsolation, analyticsController.getWineryAnalytics);

// Dashboards Endpoints
router.get('/dashboard/:wineryId/summary', protect, restrictTo('admin', 'winery'), requireWineryIsolation, analyticsController.getDashboardSummary);
router.get('/dashboard/:wineryId/timeseries', protect, restrictTo('admin', 'winery'), requireWineryIsolation, analyticsController.getTimeSeries);

// Business Analytics Endpoint
router.get('/dashboard/:wineryId/business', protect, restrictTo('admin', 'winery'), requireWineryIsolation, analyticsController.getBusinessAnalytics);

// Report Generation Endpoints
router.get('/dashboard/:wineryId/report', protect, restrictTo('admin', 'winery'), requireWineryIsolation, analyticsController.getAnalyticsReport);
router.get('/dashboard/:wineryId/report/pdf', protect, restrictTo('admin', 'winery'), requireWineryIsolation, analyticsController.getAnalyticsReportPDF);
router.get('/dashboard/:wineryId/report/csv', protect, restrictTo('admin', 'winery'), requireWineryIsolation, analyticsController.getAnalyticsReportCSV);

// Insight Engine Endpoints
router.get('/dashboard/:wineryId/insights', protect, restrictTo('admin', 'winery'), requireWineryIsolation, analyticsController.getInsights);
router.post('/recommendations/generate', protect, restrictTo('admin', 'winery'), requireWineryIsolation, analyticsController.generateRecommendations);
router.put('/recommendations/:id/status', protect, restrictTo('admin', 'winery'), analyticsController.updateRecommendationStatus);

// User preferences
router.get('/user/:userId/preferences', protect, analyticsController.getUserPreferences);
router.get('/user/preferences', protect, analyticsController.getUserPreferences);

export default router;
