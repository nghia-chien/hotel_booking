import mongoose from "mongoose";

const pricingRuleSchema = new mongoose.Schema(
  {
    roomType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomType",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    priceType: {
      type: String,
      enum: ["fixed", "percentage"],
      default: "percentage"
    },
    value: {
      type: Number,
      required: true
    },
    applyWeekend: {
      type: Boolean,
      default: false
    },
    applyHolidays: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("PricingRule", pricingRuleSchema);

