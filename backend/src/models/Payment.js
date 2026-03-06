import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    method: {
      type: String,
      enum: ["card", "bank_transfer", "cash", "mock"],
      default: "mock"
    },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "SUCCESS"
    },
    transactionId: {
      type: String
    },
    metadata: {
      type: Object
    }
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);

