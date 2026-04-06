import { Request, Response, NextFunction } from 'express';
import { ReviewService } from './review.service.js';
import { buildPaginationOptions } from '../../utils/pagination.js';

export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  public createReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user._id;
      const result = await this.reviewService.createReview(userId, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public getRoomReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, skip, sort } = buildPaginationOptions(req);
      const roomId = req.params.id;
      const { items, total } = await this.reviewService.getRoomReviews(roomId as string, { skip, limit, sort });
      res.json({
        success: true,
        data: items,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
      });
    } catch (error) {
      next(error);
    }
  };

  public getAllReviewsAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, skip, sort } = buildPaginationOptions(req);
      const { items, total } = await this.reviewService.getAllReviewsAdmin({ skip, limit, sort });
      res.json({
        success: true,
        data: items,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
      });
    } catch (error) {
      next(error);
    }
  };

  public toggleVisibility = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.reviewService.toggleVisibility(req.params.id as string, req.body.isPublished);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public checkReviewStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user._id;
      const result = await this.reviewService.checkReviewStatus(userId, req.params.bookingId as string);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
