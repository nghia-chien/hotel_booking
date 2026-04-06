import mongoose, { Document, Schema } from 'mongoose';

export interface IRoomType extends Document {
  name: string;
  description?: string;
  basePrice: number;
  defaultCapacity: number;
  avgRating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

const roomTypeSchema = new Schema<IRoomType>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    basePrice: { type: Number, required: true, min: 0 },
    defaultCapacity: { type: Number, required: true, min: 1 },
    avgRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.RoomType || mongoose.model<IRoomType>('RoomType', roomTypeSchema);
