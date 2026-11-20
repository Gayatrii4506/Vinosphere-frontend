import { Request, Response } from 'express';
import { experienceService } from './experience.service';

export class ExperienceController {
  async getAllExperiences(req: Request, res: Response) {
    try {
      const experiences = await experienceService.getAllExperiences();
      res.status(200).json({ status: 'success', data: experiences });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async getExperienceById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const experience = await experienceService.getExperienceById(id);
      res.status(200).json({ status: 'success', data: experience });
    } catch (error: any) {
      res.status(404).json({ status: 'error', message: error.message });
    }
  }

  async createExperience(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const role = (user?.role || user?.app_metadata?.role || '').toLowerCase();
      const userWineryId = user?.wineryId || user?.app_metadata?.winery_id || user?.user_metadata?.winery_id || user?.user_metadata?.wineryId;

      if (role !== 'admin' && role !== 'superadmin') {
        if (!userWineryId) {
          return res.status(403).json({ status: 'error', message: 'No estate associated with this winery account' });
        }
        req.body.winery_id = userWineryId;
      }

      const experience = await experienceService.createExperience(req.body);
      res.status(201).json({ status: 'success', data: experience });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async updateExperience(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const existing = await experienceService.getExperienceById(id);
      if (!existing) {
        return res.status(404).json({ status: 'error', message: `Experience with ID ${id} not found` });
      }

      const user = (req as any).user;
      const role = (user?.role || user?.app_metadata?.role || '').toLowerCase();
      const userWineryId = user?.wineryId || user?.app_metadata?.winery_id || user?.user_metadata?.winery_id || user?.user_metadata?.wineryId;

      if (role !== 'admin' && role !== 'superadmin') {
        if (existing.winery_id !== userWineryId) {
          return res.status(403).json({ status: 'error', message: 'Access denied: You are not authorized to update another winery estate\'s experience.' });
        }
        delete req.body.winery_id;
      }

      const experience = await experienceService.updateExperience(id, req.body);
      res.status(200).json({ status: 'success', data: experience });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async deleteExperience(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const existing = await experienceService.getExperienceById(id);
      if (!existing) {
        return res.status(404).json({ status: 'error', message: `Experience with ID ${id} not found` });
      }

      const user = (req as any).user;
      const role = (user?.role || user?.app_metadata?.role || '').toLowerCase();
      const userWineryId = user?.wineryId || user?.app_metadata?.winery_id || user?.user_metadata?.winery_id || user?.user_metadata?.wineryId;

      if (role !== 'admin' && role !== 'superadmin') {
        if (existing.winery_id !== userWineryId) {
          return res.status(403).json({ status: 'error', message: 'Access denied: You are not authorized to delete another winery estate\'s experience.' });
        }
      }

      await experienceService.deleteExperience(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }
}

export const experienceController = new ExperienceController();
