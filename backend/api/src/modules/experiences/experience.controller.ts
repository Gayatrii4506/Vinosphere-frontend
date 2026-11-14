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
      const experience = await experienceService.createExperience(req.body);
      res.status(201).json({ status: 'success', data: experience });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async updateExperience(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const experience = await experienceService.updateExperience(id, req.body);
      res.status(200).json({ status: 'success', data: experience });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async deleteExperience(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await experienceService.deleteExperience(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }
}

export const experienceController = new ExperienceController();
