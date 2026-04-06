import { Request, Response, NextFunction } from 'express';
import { PaymentService } from './payment.service.js';
import { logger } from '../../core/utils/logger.js';

export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  public createVNPayOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { bookingIds } = req.body;
      const userId = (req as any).user._id;
      const ipAddr = this.getClientIp(req);
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const result = await this.paymentService.createVNPayOrder(bookingIds, userId, ipAddr, baseUrl);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public handleVNPayReturn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.paymentService.handleVNPayReturn(req.query);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      
      if (result.isSuccess) {
        res.redirect(`${frontendUrl}/my-bookings?payment=success&id=${result.paymentId}`);
      } else {
        res.redirect(`${frontendUrl}/my-bookings?payment=cancel&code=${result.responseCode}`);
      }
    } catch (error) {
      next(error);
    }
  };

  public getMyPayments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user._id;
      const result = await this.paymentService.getMyPayments(userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
      return first.split(',')[0].trim();
    }
    const raw = req.socket?.remoteAddress || req.ip || '127.0.0.1';
    if (raw === '::1' || raw === '::ffff:127.0.0.1') return '127.0.0.1';
    if (raw.startsWith('::ffff:')) return raw.slice(7);
    return raw;
  }
}
