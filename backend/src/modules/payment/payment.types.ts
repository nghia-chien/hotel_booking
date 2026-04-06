import { Types } from 'mongoose';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

export interface IPayment {
  _id: string | Types.ObjectId;
  booking?: string | Types.ObjectId; // Original single booking
  bookings?: (string | Types.ObjectId)[]; // Bulk/Multiple bookings
  customer: string | Types.ObjectId;
  amount: number;
  method: string; // 'vnpay', 'mock', 'refund', etc.
  status: PaymentStatus;
  transactionId?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentRepository {
  findById(id: string): Promise<IPayment | null>;
  findOne(filter: any): Promise<IPayment | null>;
  find(filter: any, options?: any): Promise<IPayment[]>;
  create(data: Partial<IPayment>): Promise<IPayment>;
  update(id: string, data: Partial<IPayment>): Promise<IPayment | null>;
}
