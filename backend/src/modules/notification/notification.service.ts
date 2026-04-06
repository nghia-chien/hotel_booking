import { NotificationRepository, INotification, NotificationType } from './notification.types.js';
import { AppError } from '../../core/errors/AppError.js';
import { logger } from '../../core/utils/logger.js';

export class NotificationService {
  constructor(private readonly notificationRepo: NotificationRepository) {}

  async getMyNotifications(userId: string, filter: any, options: any): Promise<{ items: INotification[], total: number, unreadCount: number }> {
    const query = { recipient: userId, ...filter };
    const [items, total] = await Promise.all([
      this.notificationRepo.find(query, options),
      this.notificationRepo.count(query),
    ]);

    const unreadCount = await this.notificationRepo.count({ recipient: userId, isRead: false });

    return { items, total, unreadCount };
  }

  async createNotification(recipient: string, type: NotificationType, data: any): Promise<INotification> {
    const messageMapping: Record<NotificationType, { title: string, message: (d: any) => string }> = {
      booking_confirmed: {
        title: 'Đặt phòng thành công',
        message: (d) => `Phòng ${d.roomName} đã được xác nhận từ ngày ${d.checkIn}. Tổng tiền: ${d.totalPrice.toLocaleString()}.`
      },
      payment_success: {
        title: 'Thanh toán thành công',
        message: (d) => `Thanh toán cho mã đặt phòng ${d.bookingId} đã được xử lý thành công qua VNPay.`
      },
      booking_cancelled: {
        title: 'Hủy đặt phòng',
        message: (d) => `Phòng ${d.roomName} (Mã: ${d.bookingId}) đã bị hủy. Lý do: ${d.reason}.`
      },
      refund_processed: {
        title: 'Hoàn tiền thành công',
        message: (d) => `Số tiền ${d.amount.toLocaleString()} VND đã được hoàn lại cho mã đặt phòng ${d.bookingId}.`
      },
      other: {
        title: 'Thông báo',
        message: (d) => d.message || ''
      },
    };

    const mapping = messageMapping[type] || messageMapping.other;
    const notification = await this.notificationRepo.create({
      recipient: recipient as any,
      type,
      title: mapping.title,
      message: mapping.message(data),
      data,
      isRead: false,
    });

    logger.info('Notification created', { notificationId: (notification as any)._id, recipient, type });
    return notification;
  }

  async markAsRead(userId: string, id: string): Promise<INotification> {
    const notification = await this.notificationRepo.findById(id);
    if (!notification || (notification.recipient as any).toString() !== userId) {
      throw new AppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
    }

    const updated = await this.notificationRepo.update(id, { isRead: true });
    if (!updated) throw new AppError('Failed to update notification', 500);
    return updated;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepo.markAllAsRead(userId);
  }

  async deleteNotification(userId: string, id: string): Promise<void> {
    const notification = await this.notificationRepo.findById(id);
    if (!notification || (notification.recipient as any).toString() !== userId) {
      throw new AppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
    }
    await this.notificationRepo.delete(id);
  }
}
