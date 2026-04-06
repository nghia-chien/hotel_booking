import { MongoReviewRepository } from './review.repository.js';
import { ReviewService } from './review.service.js';
import { ReviewController } from './review.controller.js';

const reviewRepository = new MongoReviewRepository();
const reviewService = new ReviewService(reviewRepository);
const reviewController = new ReviewController(reviewService);

export { reviewRepository, reviewService, reviewController };
