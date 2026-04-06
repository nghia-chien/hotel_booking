import mongoose, { Document, Schema } from 'mongoose';

export interface IPricingRule extends Document {
  roomType: mongoose.Types.ObjectId;
  name: string;
  startDate: Date;
  endDate: Date;
  priceType: 'fixed' | 'percentage';
  value: number;
  applyWeekend: boolean;
  applyHolidays: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pricingRuleSchema = new Schema<IPricingRule>(
  {
    roomType: { type: Schema.Types.ObjectId, ref: 'RoomType', required: true },
    name: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    priceType: { type: String, enum: ['fixed', 'percentage'], default: 'percentage' },
    value: { type: Number, required: true },
    applyWeekend: { type: Boolean, default: false },
    applyHolidays: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.PricingRule || mongoose.model<IPricingRule>('PricingRule', pricingRuleSchema);
