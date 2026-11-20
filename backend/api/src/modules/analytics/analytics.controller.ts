import { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { RecommendationService } from './recommendation.service';
import { supabaseAdmin as supabase } from '../../config/supabase';

const analyticsService = new AnalyticsService();
const recommendationService = new RecommendationService();

export class AnalyticsController {
  async trackEvent(req: Request, res: Response) {
    try {
      // Typically user_id comes from auth middleware, but we allow it from body for generic events if needed
      const userId = (req as any).user?.id || req.body.user_id;
      const event = await analyticsService.trackEvent({
        ...req.body,
        user_id: userId
      });
      res.status(201).json({ status: 'success', data: event });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async getWineryAnalytics(req: Request, res: Response) {
    try {
      const wineryId = String(req.params.wineryId || '');
      const user = (req as any).user;
      const role = (user?.role || user?.app_metadata?.role || '').toLowerCase();
      const userWineryId = user?.wineryId || user?.app_metadata?.winery_id || user?.user_metadata?.winery_id || user?.user_metadata?.wineryId;

      if (role !== 'admin' && role !== 'superadmin') {
        if (!userWineryId || String(wineryId).toLowerCase() !== String(userWineryId).toLowerCase()) {
          return res.status(403).json({ status: 'error', message: 'Access denied: You are not authorized to view another winery estate\'s analytics.' });
        }
      }

      const analytics = await analyticsService.getWineryAnalytics(wineryId);
      res.status(200).json({ status: 'success', data: analytics });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async getAdminAnalytics(req: Request, res: Response) {
    try {
      // Assume auth middleware verifies admin role
      const analytics = await analyticsService.getAdminAnalytics();
      res.status(200).json({ status: 'success', data: analytics });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async getUserPreferences(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || req.params.userId;
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'User ID required' });
      }
      const preferences = await analyticsService.getUserPreferences(userId);
      res.status(200).json({ status: 'success', data: preferences });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  // Phase 10: Dashboards summary
  async getDashboardSummary(req: Request, res: Response) {
      try {
          const wineryId = String(req.params.wineryId || '');
          if (!wineryId) return res.status(400).json({ error: 'wineryId required' });
          const summary = await analyticsService.getDashboardSummary(wineryId);
          res.json({ status: 'success', data: summary });
      } catch (error: any) {
          console.error('Error fetching dashboard summary:', error);
          res.status(500).json({ error: error.message });
      }
  }

  // Phase 10: Timeseries
  async getTimeSeries(req: Request, res: Response) {
      try {
          const wineryId = String(req.params.wineryId || '');
          if (!wineryId) return res.status(400).json({ error: 'wineryId required' });
          const timeseries = await analyticsService.getTimeSeries(wineryId);
          res.json({ status: 'success', data: timeseries });
      } catch (error: any) {
          console.error('Error fetching timeseries:', error);
          res.status(500).json({ error: error.message });
      }
  }

  // Phase 10: API - Get insights for a winery
  async getInsights(req: Request, res: Response) {
    try {
        const wineryId = String(req.params.wineryId || '');
        
        if (!wineryId) {
            return res.status(400).json({ error: 'wineryId is required' });
        }

        // Process wine and business insights to ensure fresh actionable insights
        await RecommendationService.processWineInsights(wineryId).catch(() => {});
        await RecommendationService.processBusinessInsights(wineryId).catch(() => {});

        const data = await RecommendationService.getRecommendations(wineryId);

        res.json({
            status: 'success',
            data
        });
    } catch (error) {
        console.error('Error fetching insights:', error);
        res.status(500).json({ error: 'Failed to fetch insights' });
    }
  }

  // Phase 10: API - Generate recommendations manually
  async generateRecommendations(req: Request, res: Response) {
    try {
        let wineryId = req.body?.wineryId || req.body?.winery_id;
        const user = (req as any).user;
        const role = (user?.role || user?.app_metadata?.role || '').toLowerCase();
        const userWineryId = user?.wineryId || user?.app_metadata?.winery_id || user?.user_metadata?.winery_id || user?.user_metadata?.wineryId;

        if (role !== 'admin' && role !== 'superadmin') {
          if (!userWineryId) {
            return res.status(403).json({ error: 'No winery estate linked to this account' });
          }
          if (wineryId && String(wineryId).trim().toLowerCase() !== String(userWineryId).trim().toLowerCase()) {
            return res.status(403).json({ error: 'Access denied: You cannot generate recommendations for another winery estate' });
          }
          wineryId = userWineryId;
        }

        if (!wineryId) {
            return res.status(400).json({ error: 'wineryId is required' });
        }

        const results = await RecommendationService.processWineInsights(wineryId);

        res.json({
            status: 'success',
            message: 'Insight generation complete',
            data: results
        });
    } catch (error) {
        console.error('Error generating recommendations:', error);
        res.status(500).json({ error: 'Failed to generate recommendations' });
    }
  }

  // Phase 10: API - Update recommendation status
  async updateRecommendationStatus(req: Request, res: Response) {
    try {
        const id = String(req.params.id || '');
        const { status } = req.body;

        const validStatuses = ['active', 'viewed', 'accepted', 'dismissed', 'completed', 'expired'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const { data, error } = await supabase
            .from('recommendations')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error || !data) {
            const updatedInMemory = RecommendationService.updateInMemoryStatus(id, status);
            if (updatedInMemory) {
                return res.json({
                    status: 'success',
                    data: { id, status }
                });
            }
            if (error) throw error;
        }

        res.json({
            status: 'success',
            data
        });
    } catch (error) {
        console.error('Error updating recommendation status:', error);
        res.status(500).json({ error: 'Failed to update recommendation status' });
    }
  }

  // Phase 12A: Business Analytics summary
  async getBusinessAnalytics(req: Request, res: Response) {
      try {
          const wineryId = String(req.params.wineryId || '');
          const periodStr = (req.query.period as string) || '7d';
          const periodDays = parseInt(periodStr.replace(/\D/g, '')) || 7;
          if (!wineryId) return res.status(400).json({ error: 'wineryId required' });
          const data = await analyticsService.getBusinessAnalytics(wineryId, periodDays);
          res.json({ status: 'success', data });
      } catch (error: any) {
          console.error('Error fetching business analytics:', error);
          res.status(500).json({ error: error.message });
      }
  }

  // Phase 13: Structured Analytics Report JSON
  async getAnalyticsReport(req: Request, res: Response) {
    try {
      const wineryId = String(req.params.wineryId || '');
      const periodStr = (req.query.period as string) || '7d';
      const periodDays = parseInt(periodStr.replace(/\D/g, '')) || 7;
      if (!wineryId) return res.status(400).json({ error: 'wineryId is required' });

      const { ReportService } = require('./report.service');
      const report = await ReportService.generateReport(wineryId, periodDays);
      res.json({ status: 'success', data: report });
    } catch (error: any) {
      console.error('Error generating analytics report:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Phase 13: Analytics Report PDF Download
  async getAnalyticsReportPDF(req: Request, res: Response) {
    try {
      const { wineryId } = req.params;
      const periodStr = (req.query.period as string) || '7d';
      const periodDays = parseInt(periodStr.replace(/\D/g, '')) || 7;
      if (!wineryId) return res.status(400).json({ error: 'wineryId is required' });

      const { ReportService } = require('./report.service');
      const report = await ReportService.generateReport(wineryId, periodDays);
      const pdfBuffer = await ReportService.generatePDF(report);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=vinosphere-analytics-report-${wineryId}-${periodStr}.pdf`);
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error('Error generating analytics report PDF:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Phase 13: Analytics Report CSV Download
  async getAnalyticsReportCSV(req: Request, res: Response) {
    try {
      const { wineryId } = req.params;
      const periodStr = (req.query.period as string) || '7d';
      const periodDays = parseInt(periodStr.replace(/\D/g, '')) || 7;
      if (!wineryId) return res.status(400).json({ error: 'wineryId is required' });

      const { ReportService } = require('./report.service');
      const report = await ReportService.generateReport(wineryId, periodDays);
      const csvContent = ReportService.generateCSV(report);

      res.setHeader('Content-Type', 'text/csv');
      res.send(csvContent);
    } catch (error: any) {
      console.error('Error generating analytics report CSV:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Seed Sula Analytics Dataset
  async seedSulaAnalytics(req: Request, res: Response) {
    try {
      const { seedSulaDataset } = require('../../../scripts/seed-sula-analytics');
      await seedSulaDataset();
      res.status(200).json({ status: 'success', message: 'Sula Vineyards analytics dataset successfully seeded!' });
    } catch (error: any) {
      console.error('Error seeding Sula analytics dataset:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
}

export const analyticsController = new AnalyticsController();
