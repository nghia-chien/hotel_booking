import mongoose from "mongoose";

const outboxEmailSchema = new mongoose.Schema(
  {
    to: {
      type: String,
      required: true,
      index: true
    },
    subject: {
      type: String,
      required: true
    },
    html: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["PENDING", "SENT", "FAILED"],
      default: "PENDING",
      index: true
    },
    retryCount: {
      type: Number,
      default: 0
    },
    error: {
      type: String
    },
    nextRetryAt: {
      type: Date,
      index: true
    },
    sentAt: {
      type: Date
    }
  },
  { timestamps: true }
);

outboxEmailSchema.index({ status: 1, nextRetryAt: 1 });

export default mongoose.model("OutboxEmail", outboxEmailSchema);
