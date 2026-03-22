import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: false,
    },
    bookings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
      },
    ],
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    method: {
      type: String,
      enum: ["card", "bank_transfer", "cash", "mock", "stripe", "vnpay", "refund"],
      default: "mock",
    },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
    transactionId: {
      type: String,
    },

    // ── VNPay fields ──────────────────────────────────────────────────────────
    vnpTxnRef: {
      type: String,  // txnRef bạn tự tạo (BK<timestamp>), dùng để tra cứu
      index: true,
    },
    vnpTransactionNo: {
      type: String,  // mã giao dịch phía VNPay trả về
    },

    // ── Metadata (lưu raw params VNPay, refund info, v.v.) ───────────────────
    metadata: {
      type: Object,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
