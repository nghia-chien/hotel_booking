import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    roomType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomType",
      required: true
    },
    capacity: {
      type: Number,
      required: true,
      min: 1
    },
    amenities: [
      {
        type: String,
        trim: true
      }
    ],
    policies: {
      type: String
    },
    images: [
      {
        type: String
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    },
    avgRating: {
      type: Number,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);

