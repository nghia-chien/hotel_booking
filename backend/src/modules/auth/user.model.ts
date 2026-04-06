import mongoose, { Schema, model, Document, Types } from 'mongoose';
import { IUser } from './auth.types.js';

interface UserDocument extends IUser, Document {
  _id: Types.ObjectId;
}

const userSchema = new Schema<UserDocument>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      trim: true,
      index: true,
    },
    address: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'staff'],
      default: 'user',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    resetPasswordToken: {
      type: String,
      index: true,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const UserModel = mongoose.models.User || model<UserDocument>('User', userSchema);
