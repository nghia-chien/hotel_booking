import mongoose from "mongoose";
import Room from "./Room.js";
import RoomType from "./RoomType.js";

const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true
    },
    roomType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomType",
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "{VALUE} is not an integer"
      }
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    isVisible: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Indexes
reviewSchema.index({ room: 1, isVisible: 1, createdAt: -1 });
reviewSchema.index({ roomType: 1, isVisible: 1, createdAt: -1 });

// Statics for updating Room and RoomType stats
reviewSchema.statics.updateStats = async function(roomId, roomTypeId) {
  const stats = await this.aggregate([
    { $match: { room: roomId, isVisible: true } },
    { $group: { _id: "$room", avgRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } }
  ]);

  if (stats.length > 0) {
    await Room.findByIdAndUpdate(roomId, {
      avgRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].totalReviews
    });
  } else {
    await Room.findByIdAndUpdate(roomId, { avgRating: 0, totalReviews: 0 });
  }

  const typeStats = await this.aggregate([
    { $match: { roomType: roomTypeId, isVisible: true } },
    { $group: { _id: "$roomType", avgRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } }
  ]);

  if (typeStats.length > 0) {
    await RoomType.findByIdAndUpdate(roomTypeId, {
      avgRating: Math.round(typeStats[0].avgRating * 10) / 10,
      totalReviews: typeStats[0].totalReviews
    });
  } else {
    await RoomType.findByIdAndUpdate(roomTypeId, { avgRating: 0, totalReviews: 0 });
  }
};

// Hook to update stats after save/update
reviewSchema.post("save", function() {
  this.constructor.updateStats(this.room, this.roomType);
});

// For update/delete, we would need more hooks like post('findOneAndUpdate')
// But for now, POST /api/reviews and admin toggle isVisible are the only changes.
// I'll add hook for admin toggle visibility in the controller.

export default mongoose.model("Review", reviewSchema);
