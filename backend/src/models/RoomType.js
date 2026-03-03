import mongoose from "mongoose";

const roomTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    defaultCapacity: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { timestamps: true }
);

export default mongoose.model("RoomType", roomTypeSchema);

