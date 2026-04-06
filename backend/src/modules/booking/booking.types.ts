import { Types } from 'mongoose';

export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'CheckedIn' | 'CheckedOut';
export type PaymentStatus = 'Pending' | 'Paid' | 'Refunded';

export interface IBooking {
  _id: string | Types.ObjectId;
  customer: string | Types.ObjectId;
  room: string | Types.ObjectId;
  roomType: string | Types.ObjectId;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  specialRequest?: string;
  cancellationDeadline?: Date;
  refundPercentage?: number;
  cancelledAt?: Date;
  refundedAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookingDto {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  specialRequest?: string;
}

export interface SearchRoomsDto {
  checkIn: string;
  checkOut: string;
  guests: number;
  roomType?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface BookingRepository {
  findById(id: string): Promise<IBooking | null>;
  find(filter: any, options?: any): Promise<IBooking[]>;
  count(filter: any): Promise<number>;
  create(data: Partial<IBooking>): Promise<IBooking>;
  update(id: string, data: Partial<IBooking>): Promise<IBooking | null>;
  exists(filter: any): Promise<boolean>;
}
