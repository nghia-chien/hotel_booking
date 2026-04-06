import mongoose, { Schema, model, Document, Types } from 'mongoose';
import { IPayment } from './payment.types.js';

interface PaymentDocument extends IPayment, Document {
  _id: Types.ObjectId;
}

const paymentSchema = new Schema<PaymentDocument>(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      index: true,
    },
    bookings: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
        index: true,
      },
    ],
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    method: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

paymentSchema.index({ createdAt: -1 });

export const PaymentModel = mongoose.models.Payment || model<PaymentDocument>('Payment', paymentSchema);
