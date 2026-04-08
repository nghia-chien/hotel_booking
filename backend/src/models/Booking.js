import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true
    },
    roomType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomType",
      required: true
    },
    checkIn: {
      type: Date,
      required: true
    },
    checkOut: {
      type: Date,
      required: true
    },
    guests: {
      type: Number,
      required: true,
      min: 1
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Expired", "Cancelled", "CheckedIn", "CheckedOut"],
      default: "Pending"
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Refunded", "Failed", "Cancelled"],
      default: "Pending"
    },
    specialRequest: {
      type: String
    },
    cancellationDeadline: {
      type: Date
    },
    refundPercentage: {
      type: Number,
      min: 0,
      max: 100
    },
    cancelledAt: {
      type: Date
    },
    refundedAmount: {
      type: Number,
      min: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);

