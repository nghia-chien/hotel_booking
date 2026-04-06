import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  customer: mongoose.Types.ObjectId;
  room: mongoose.Types.ObjectId;
  roomType: mongoose.Types.ObjectId;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'CheckedIn' | 'CheckedOut';
  paymentStatus: 'Pending' | 'Paid' | 'Refunded';
  specialRequest?: string;
  cancellationDeadline?: Date;
  refundPercentage?: number;
  cancelledAt?: Date;
  refundedAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    roomType: { type: Schema.Types.ObjectId, ref: 'RoomType', required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled', 'CheckedIn', 'CheckedOut'],
      default: 'Pending',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Refunded'],
      default: 'Pending',
    },
    specialRequest: { type: String },
    cancellationDeadline: { type: Date },
    refundPercentage: { type: Number, min: 0, max: 100 },
    cancelledAt: { type: Date },
    refundedAmount: { type: Number, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
