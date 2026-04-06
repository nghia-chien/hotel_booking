import mongoose, { Schema, model, Document, Types } from 'mongoose';
import { IRoom } from './room.types.js';

interface RoomDocument extends IRoom, Document {
  _id: Types.ObjectId;
}

const roomSchema = new Schema<RoomDocument>(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    roomType: {
      type: Schema.Types.ObjectId,
      ref: 'RoomType',
      required: true,
      index: true,
    },
    floor: {
      type: Number,
      required: true,
      index: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const RoomModel = mongoose.models.Room || model<RoomDocument>('Room', roomSchema);
