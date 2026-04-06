import mongoose, { Schema, model, Document, Types } from 'mongoose';
import { INotification } from './notification.types.js';

interface NotificationDocument extends INotification, Document {
  _id: Types.ObjectId;
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['booking_confirmed', 'payment_success', 'booking_cancelled', 'refund_processed', 'other'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

notificationSchema.index({ createdAt: -1 });

export const NotificationModel = mongoose.models.Notification || model<NotificationDocument>('Notification', notificationSchema);
