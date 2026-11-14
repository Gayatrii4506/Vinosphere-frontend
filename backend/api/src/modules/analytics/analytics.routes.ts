import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { protect } from '../../middleware/authMiddleware';
import edaRoutes from './eda.routes';

const router = Router();

// EDA (Exploratory Data Analysis) sub-routes
router.use('/eda', edaRoutes);

// Track an event (public or authenticated)
router.post('/track', analyticsController.trackEvent);
router.post('/seed-sula', analyticsController.seedSulaAnalytics);
// Get winery analytics (existing full stats, can be deprecated later)
router.get('/winery/:wineryId', protect, analyticsController.getWineryAnalytics);

// Phase 10: New Explicit Dashboards Endpoints
router.get('/dashboard/:wineryId/summary', analyticsController.getDashboardSummary);
router.get('/dashboard/:wineryId/timeseries', analyticsController.getTimeSeries);

// Phase 12A: Business Analytics Endpoint
router.get('/dashboard/:wineryId/business', analyticsController.getBusinessAnalytics);

// Phase 13: Report Generation Endpoints
router.get('/dashboard/:wineryId/report', analyticsController.getAnalyticsReport);
router.get('/dashboard/:wineryId/report/pdf', analyticsController.getAnalyticsReportPDF);
router.get('/dashboard/:wineryId/report/csv', analyticsController.getAnalyticsReportCSV);

// Phase 10: Insight Engine Endpoints
router.get('/dashboard/:wineryId/insights', analyticsController.getInsights);
router.post('/recommendations/generate', analyticsController.generateRecommendations);
router.put('/recommendations/:id/status', analyticsController.updateRecommendationStatus);

// Get admin analytics
router.get('/admin', protect, analyticsController.getAdminAnalytics);

// Get user preferences
router.get('/user/:userId/preferences', protect, analyticsController.getUserPreferences);
router.get('/user/preferences', protect, analyticsController.getUserPreferences);

export default router;
