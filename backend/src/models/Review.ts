import mongoose, { Document, Schema, Model } from 'mongoose';
import Room from './Room.js';
import RoomType from './RoomType.js';

export interface IReview extends Document {
  booking: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  room: mongoose.Types.ObjectId;
  roomType: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IReviewModel extends Model<IReview> {
  updateStats(roomId: mongoose.Types.ObjectId, roomTypeId: mongoose.Types.ObjectId): Promise<void>;
}

const reviewSchema = new Schema<IReview, IReviewModel>(
  {
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    roomType: { type: Schema.Types.ObjectId, ref: 'RoomType', required: true },
    rating: {
      type: Number, required: true, min: 1, max: 5,
      validate: { validator: Number.isInteger, message: '{VALUE} is not an integer' },
    },
    comment: { type: String, required: true, trim: true, maxlength: 500 },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

reviewSchema.index({ room: 1, isVisible: 1, createdAt: -1 });
reviewSchema.index({ roomType: 1, isVisible: 1, createdAt: -1 });

reviewSchema.statics.updateStats = async function (
  roomId: mongoose.Types.ObjectId,
  roomTypeId: mongoose.Types.ObjectId
): Promise<void> {
  const stats = await this.aggregate([
    { $match: { room: roomId, isVisible: true } },
    { $group: { _id: '$room', avgRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await Room.findByIdAndUpdate(roomId, {
      avgRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
    });
  } else {
    await Room.findByIdAndUpdate(roomId, { avgRating: 0, totalReviews: 0 });
  }

  const typeStats = await this.aggregate([
    { $match: { roomType: roomTypeId, isVisible: true } },
    { $group: { _id: '$roomType', avgRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } },
  ]);

  if (typeStats.length > 0) {
    await RoomType.findByIdAndUpdate(roomTypeId, {
      avgRating: Math.round(typeStats[0].avgRating * 10) / 10,
      totalReviews: typeStats[0].totalReviews,
    });
  } else {
    await RoomType.findByIdAndUpdate(roomTypeId, { avgRating: 0, totalReviews: 0 });
  }
};

reviewSchema.post('save', function (this: IReview) {
  (this.constructor as IReviewModel).updateStats(
    this.room as mongoose.Types.ObjectId,
    this.roomType as mongoose.Types.ObjectId
  );
});

export default mongoose.models.Review || mongoose.model<IReview, IReviewModel>('Review', reviewSchema);
