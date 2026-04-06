import { PaymentRepository, IPayment } from './payment.types.js';
import { PaymentModel } from './payment.model.js';
import mongoose from 'mongoose';

export class MongoPaymentRepository implements PaymentRepository {
  async findById(id: string): Promise<IPayment | null> {
    const payment = await PaymentModel.findById(id).populate('customer').populate('booking');
    return payment ? payment.toObject() : null;
  }

  async findOne(filter: Record<string, any>): Promise<IPayment | null> {
    const payment = await PaymentModel.findOne(filter).populate('customer');
    return payment ? payment.toObject() : null;
  }

  async find(filter: Record<string, any>, options: mongoose.QueryOptions = {}): Promise<IPayment[]> {
    const payments = await PaymentModel.find(filter, null, options)
      .populate('customer')
      .populate({
        path: 'booking',
        populate: [
          { path: 'room' },
          { path: 'roomType' }
        ]
      })
      .populate({
        path: 'bookings',
        populate: [
          { path: 'room' },
          { path: 'roomType' }
        ]
      });
    return payments.map((p) => p.toObject());
  }

  async create(data: Partial<IPayment>): Promise<IPayment> {
    const payment = await PaymentModel.create(data);
    return payment.toObject();
  }

  async update(id: string, data: Partial<IPayment>): Promise<IPayment | null> {
    const payment = await PaymentModel.findByIdAndUpdate(id, data, { new: true });
    return payment ? payment.toObject() : null;
  }
}
