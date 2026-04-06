import { BookingRepository, IBooking } from './booking.types.js';
import { BookingModel } from './booking.model.js';
import mongoose from 'mongoose';

export class MongoBookingRepository implements BookingRepository {
  async findById(id: string): Promise<IBooking | null> {
    return await BookingModel.findById(id)
      .populate('room')
      .populate('roomType')
      .populate('customer', '-password');
  }

  async find(filter: Record<string, any>, options: Record<string, any> = {}): Promise<IBooking[]> {
    return await BookingModel.find(filter, null, options)
      .populate('room')
      .populate('roomType')
      .populate('customer', '-password');
  }

  async count(filter: Record<string, any>): Promise<number> {
    return await BookingModel.countDocuments(filter);
  }

  async create(data: Partial<IBooking>): Promise<IBooking> {
    const booking = await BookingModel.create(data);
    return booking.toObject();
  }

  async update(id: string, data: Partial<IBooking>): Promise<IBooking | null> {
    const booking = await BookingModel.findByIdAndUpdate(id, data, { new: true });
    return booking ? booking.toObject() : null;
  }

  async exists(filter: Record<string, any>): Promise<boolean> {
    const exists = await BookingModel.exists(filter);
    return !!exists;
  }
}
