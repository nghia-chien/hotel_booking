import mongoose, { Schema, model, Document, Types } from 'mongoose';
import { IRoomType } from './room.types.js';

interface RoomTypeDocument extends IRoomType, Document {
  _id: Types.ObjectId;
}

const roomTypeSchema = new Schema<RoomTypeDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    amenities: [
      {
        type: String,
        trim: true,
        index: true,
      },
    ],
    images: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const RoomTypeModel = mongoose.models.RoomType || model<RoomTypeDocument>('RoomType', roomTypeSchema);
