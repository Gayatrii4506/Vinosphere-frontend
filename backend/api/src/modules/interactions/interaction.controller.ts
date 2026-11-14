import { Request, Response } from 'express';
import { interactionService } from './interaction.service';

export class InteractionController {
  async recordInteraction(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userId = user?.id || req.body.userId || req.body.user_id || 'anonymous-user';

      const interaction = await interactionService.recordInteraction(userId, req.body);
      res.status(201).json({ status: 'success', data: interaction });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async getMyInteractions(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const interactions = await interactionService.getUserInteractions(user.id, limit);
      res.status(200).json({ status: 'success', data: interactions });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async getMyInteractionSummary(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
      }

      const summary = await interactionService.getUserInteractionSummary(user.id);
      res.status(200).json({ status: 'success', data: summary });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async resetMyInteractions(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userId = user?.id || req.body?.userId;
      if (!userId) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
      }

      await interactionService.resetUserInteractions(userId);
      res.status(200).json({ status: 'success', message: 'Interactions successfully reset' });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
}

export const interactionController = new InteractionController();
