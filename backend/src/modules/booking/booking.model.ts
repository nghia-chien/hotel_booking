import mongoose, { Schema, model, Document, Types } from 'mongoose';
import { IBooking } from './booking.types.js';

interface BookingDocument extends IBooking, Document {
  _id: Types.ObjectId;
}

const bookingSchema = new Schema<BookingDocument>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true,
    },
    roomType: {
      type: Schema.Types.ObjectId,
      ref: 'RoomType',
      required: true,
      index: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    guests: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled', 'CheckedIn', 'CheckedOut'],
      default: 'Pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Refunded'],
      default: 'Pending',
      index: true,
    },
    specialRequest: {
      type: String,
    },
    cancellationDeadline: {
      type: Date,
    },
    refundPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    cancelledAt: {
      type: Date,
    },
    refundedAmount: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound indexes for common queries
bookingSchema.index({ room: 1, status: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ checkIn: 1, checkOut: 1 });

export const BookingModel = mongoose.models.Booking || model<BookingDocument>('Booking', bookingSchema);
