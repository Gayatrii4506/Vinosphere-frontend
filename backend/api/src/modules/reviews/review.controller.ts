import { Request, Response } from 'express';
import { reviewService } from './review.service';

export class ReviewController {
  async getAllReviews(req: Request, res: Response) {
    try {
      const reviews = await reviewService.getAllReviews();
      res.status(200).json({ status: 'success', data: reviews });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async getReviewById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const review = await reviewService.getReviewById(id);
      res.status(200).json({ status: 'success', data: review });
    } catch (error: any) {
      res.status(404).json({ status: 'error', message: error.message });
    }
  }

  async createReview(req: Request, res: Response) {
    try {
      const review = await reviewService.createReview(req.body);
      res.status(201).json({ status: 'success', data: review });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async updateReview(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const review = await reviewService.updateReview(id, req.body);
      res.status(200).json({ status: 'success', data: review });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async deleteReview(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await reviewService.deleteReview(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }
}

export const reviewController = new ReviewController();
