import { Request, Response, NextFunction } from 'express';
import { BookingService } from './booking.service.js';
import { CreateBookingDto, SearchRoomsDto } from './booking.types.js';
import { logger } from '../../core/utils/logger.js';
import { AppError } from '../../core/errors/AppError.js';
import { buildPaginationOptions } from '../../utils/pagination.js';

export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  public searchAvailableRooms = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as unknown as SearchRoomsDto;
      const { page, limit, skip } = buildPaginationOptions(req);
      const { paged, total } = await this.bookingService.searchAvailableRooms({ ...query, page, limit });
      
      const pagedResult = paged.slice(skip, skip + limit);

      res.json({
        success: true,
        data: pagedResult,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  };

  public createBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as CreateBookingDto;
      const userId = (req as any).user._id;
      const result = await this.bookingService.createBooking(userId, dto);
      logger.info('Booking created controller response', { bookingId: (result as any)._id, userId });
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public payBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user._id;
      const userRole = (req as any).user.role;
      const id = req.params.id as string;
      const result = await this.bookingService.payBooking(userId, userRole, id, req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user._id;
      const { page, limit, skip, sort } = buildPaginationOptions(req);
      const { items, total } = await this.bookingService.getMyBookings(userId, { skip, limit, sort });
      res.json({
        success: true,
        data: items,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
      });
    } catch (error) {
      next(error);
    }
  };

  public getBookingById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user._id;
      const userRole = (req as any).user.role;
      const id = req.params.id as string;
      const booking = await this.bookingService.getBookingById(userId, userRole, id);
      res.json({ success: true, data: booking });
    } catch (error) {
      next(error);
    }
  };

  public cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user._id;
      const userRole = (req as any).user.role;
      const id = req.params.id as string;
      const { reason } = req.body;
      const result = await this.bookingService.cancelBooking(userId, userRole, id, reason, req);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, skip, sort } = buildPaginationOptions(req);
      const { items, total } = await this.bookingService.getAllBookings({ skip, limit, sort });
      res.json({
        success: true,
        data: items,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
      });
    } catch (error) {
      next(error);
    }
  };
}
