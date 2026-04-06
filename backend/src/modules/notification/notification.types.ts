import { Types } from 'mongoose';

export type NotificationType = 'booking_confirmed' | 'payment_success' | 'booking_cancelled' | 'refund_processed' | 'other';

export interface INotification {
  _id: string | Types.ObjectId;
  recipient: string | Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationRepository {
  findById(id: string): Promise<INotification | null>;
  find(filter: any, options?: any): Promise<INotification[]>;
  create(data: Partial<INotification>): Promise<INotification>;
  update(id: string, data: Partial<INotification>): Promise<INotification | null>;
  delete(id: string): Promise<boolean>;
  count(filter: any): Promise<number>;
  markAllAsRead(recipient: string): Promise<void>;
}
