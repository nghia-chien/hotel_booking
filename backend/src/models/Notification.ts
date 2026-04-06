import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: 'booking_confirmed' | 'booking_cancelled' | 'payment_success' | 'refund_processed' | 'new_review';
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      required: true,
      enum: ['booking_confirmed', 'booking_cancelled', 'payment_success', 'refund_processed', 'new_review'],
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);
