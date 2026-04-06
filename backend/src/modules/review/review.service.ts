import { ReviewRepository, IReview } from './review.types.js';
import { AppError } from '../../core/errors/AppError.js';
import { logger } from '../../core/utils/logger.js';
import Booking from '../../models/Booking.js';
import Room from '../../models/Room.js';

export class ReviewService {
  constructor(private readonly reviewRepo: ReviewRepository) {}

  async createReview(userId: string, data: any): Promise<IReview> {
    const { bookingId, rating, comment } = data;

    const booking = await Booking.findById(bookingId).populate('room');
    if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');

    const customerId = (booking.customer as any)._id || booking.customer;
    if (customerId.toString() !== userId) {
      throw new AppError('Not authorized to review this stay', 403, 'FORBIDDEN');
    }

    if (booking.status !== 'CheckedOut') {
      throw new AppError('Only checked-out stays can be reviewed', 400, 'INVALID_STATUS');
    }

    try {
      const review = await this.reviewRepo.create({
        booking: bookingId as any,
        customer: userId as any,
        room: (booking.room as any)._id,
        rating,
        comment,
        isPublished: true,
      });

      logger.info('Review created', { reviewId: (review as any)._id, bookingId });
      return review;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new AppError('You have already reviewed this stay', 400, 'ALREADY_REVIEWED');
      }
      throw error;
    }
  }

  async getRoomReviews(roomId: string, options: any): Promise<{ items: IReview[], total: number }> {
    const filter = { room: roomId, isPublished: true };
    const [items, total] = await Promise.all([
      this.reviewRepo.find(filter, options),
      this.reviewRepo.count(filter),
    ]);
    return { items, total };
  }

  async getAllReviewsAdmin(options: any): Promise<{ items: IReview[], total: number }> {
    const [items, total] = await Promise.all([
      this.reviewRepo.find({}, options),
      this.reviewRepo.count({}),
    ]);
    return { items, total };
  }

  async toggleVisibility(id: string, isPublished: boolean): Promise<IReview> {
    const review = await this.reviewRepo.update(id, { isPublished });
    if (!review) throw new AppError('Review not found', 404, 'REVIEW_NOT_FOUND');
    
    logger.info('Review visibility toggled', { reviewId: id, isPublished });
    return review;
  }

  async checkReviewStatus(userId: string, bookingId: string): Promise<IReview | null> {
    const reviews = await this.reviewRepo.find({ booking: bookingId, customer: userId });
    return reviews.length > 0 ? reviews[0] : null;
  }
}
