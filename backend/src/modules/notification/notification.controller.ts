import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service.js';
import { buildPaginationOptions } from '../../utils/pagination.js';

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  public getMyNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user._id;
      const { page, limit, skip, sort } = buildPaginationOptions(req);
      const { isRead } = req.query;

      const filter: any = {};
      if (isRead !== undefined) {
        filter.isRead = isRead === 'true';
      }

      const { items, total, unreadCount } = await this.notificationService.getMyNotifications(userId, filter, { skip, limit, sort });
      res.json({
        success: true,
        data: items,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        unreadCount
      });
    } catch (error) {
      next(error);
    }
  };

  public markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user._id;
      const result = await this.notificationService.markAsRead(userId, req.params.id as string);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user._id;
      await this.notificationService.markAllAsRead(userId);
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  };

  public deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user._id;
      await this.notificationService.deleteNotification(userId, req.params.id as string);
      res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
      next(error);
    }
  };
}
