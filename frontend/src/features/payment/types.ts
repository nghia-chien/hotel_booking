export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

export interface Payment {
  id: string;
  _id?: string;
  transactionId?: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  booking?: any;
  bookings?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentDTO {
  bookingId?: string;
  bookingIds?: string[];
  amount: number;
}
