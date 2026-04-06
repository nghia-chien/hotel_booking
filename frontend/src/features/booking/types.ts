export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';

export interface Booking {
  id: string;
  room: {
    id: string;
    roomNumber: string;
    roomType: {
      name: string;
      basePrice: number;
    };
  };
  customer: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  guestInfo: {
    fullName: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BookingFilter {
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
}

export interface CreateBookingDTO {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests?: number;
  guestInfo?: {
    fullName: string;
    email: string;
    phone?: string;
  };
}
