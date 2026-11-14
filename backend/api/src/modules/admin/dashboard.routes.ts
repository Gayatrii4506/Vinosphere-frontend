import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { catchAsync } from '../../shared/utils/catchAsync';

const router = Router();

// e.g. GET /api/v1/dashboard/:wineryId/inventory
router.get('/:wineryId/inventory', catchAsync(dashboardController.getInventory));

// e.g. PUT /api/v1/dashboard/inventory/:inventoryId
router.put('/inventory/:inventoryId', catchAsync(dashboardController.updateStock));

// e.g. GET /api/v1/dashboard/:wineryId/analytics
router.get('/:wineryId/analytics', catchAsync(dashboardController.getAnalytics));

// e.g. GET /api/v1/dashboard/:wineryId/overview
router.get('/:wineryId/overview', catchAsync(dashboardController.getOverview));
router.put('/:wineryId/settings', catchAsync(dashboardController.updateSettings));

// e.g. POST /api/v1/dashboard/:wineryId/wines
router.post('/:wineryId/wines', catchAsync(dashboardController.addWine));
router.put('/:wineryId/wines/:wineId', catchAsync(dashboardController.updateWine));
router.delete('/:wineryId/wines/:wineId', catchAsync(dashboardController.deleteWine));

// e.g. POST /api/v1/dashboard/:wineryId/experiences
router.post('/:wineryId/experiences', catchAsync(dashboardController.addExperience));

// e.g. POST /api/v1/dashboard/:wineryId/events
router.post('/:wineryId/events', catchAsync(dashboardController.addEvent));

export default router;
