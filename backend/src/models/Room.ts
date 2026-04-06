import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  roomNumber: string;
  roomType: mongoose.Types.ObjectId;
  capacity: number;
  amenities: string[];
  policies?: string;
  images: string[];
  isActive: boolean;
  avgRating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    roomNumber: { type: String, required: true, unique: true, trim: true },
    roomType: { type: Schema.Types.ObjectId, ref: 'RoomType', required: true },
    capacity: { type: Number, required: true, min: 1 },
    amenities: [{ type: String, trim: true }],
    policies: { type: String },
    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
    avgRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Room || mongoose.model<IRoom>('Room', roomSchema);
