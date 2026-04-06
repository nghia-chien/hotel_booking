import { NotificationRepository, INotification } from './notification.types.js';
import { NotificationModel } from './notification.model.js';
import mongoose from 'mongoose';

export class MongoNotificationRepository implements NotificationRepository {
  async findById(id: string): Promise<INotification | null> {
    const notification = await NotificationModel.findById(id);
    return notification ? notification.toObject() : null;
  }

  async find(filter: Record<string, any>, options: mongoose.QueryOptions = {}): Promise<INotification[]> {
    const notifications = await NotificationModel.find(filter, null, options);
    return notifications.map((n) => n.toObject());
  }

  async create(data: Partial<INotification>): Promise<INotification> {
    const notification = await NotificationModel.create(data);
    return notification.toObject();
  }

  async update(id: string, data: Partial<INotification>): Promise<INotification | null> {
    const notification = await NotificationModel.findByIdAndUpdate(id, data, { new: true });
    return notification ? notification.toObject() : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await NotificationModel.findByIdAndDelete(id);
    return !!result;
  }

  async count(filter: Record<string, any>): Promise<number> {
    return await NotificationModel.countDocuments(filter);
  }

  async markAllAsRead(recipient: string): Promise<void> {
    await NotificationModel.updateMany({ recipient, isRead: false }, { isRead: true });
  }
}
