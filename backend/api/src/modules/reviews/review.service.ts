import { reviewRepository } from './review.repository';

export class ReviewService {
  async getAllReviews() {
    return await reviewRepository.findAll();
  }

  async getReviewById(id: string) {
    const review = await reviewRepository.findById(id);
    if (!review) throw new Error(`Review with ID ${id} not found`);
    return review;
  }

  async createReview(data: any) {
    // Validation, e.g. check if the user has booked the experience or bought the wine
    return await reviewRepository.create(data);
  }

  async updateReview(id: string, data: any) {
    await this.getReviewById(id);
    return await reviewRepository.update(id, data);
  }

  async deleteReview(id: string) {
    await this.getReviewById(id);
    return await reviewRepository.delete(id);
  }
}

export const reviewService = new ReviewService();
