import mongoose, { Document, Schema } from 'mongoose';

export type PaymentMethod = 'card' | 'bank_transfer' | 'cash' | 'mock' | 'stripe' | 'vnpay' | 'refund';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

export interface IPayment extends Document {
  booking?: mongoose.Types.ObjectId;
  bookings: mongoose.Types.ObjectId[];
  customer: mongoose.Types.ObjectId;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  vnpTxnRef?: string;
  vnpTransactionNo?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: false },
    bookings: [{ type: Schema.Types.ObjectId, ref: 'Booking' }],
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ['card', 'bank_transfer', 'cash', 'mock', 'stripe', 'vnpay', 'refund'],
      default: 'mock',
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED'],
      default: 'PENDING',
    },
    transactionId: { type: String },
    vnpTxnRef: { type: String, index: true },
    vnpTransactionNo: { type: String },
    metadata: { type: Object },
  },
  { timestamps: true }
);

export default mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
