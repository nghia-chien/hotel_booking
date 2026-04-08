export interface RoomType {
  _id?: string;
  id?: string;
  name: string;
  basePrice: number;
  capacity?: number;
  images?: string[];
  description?: string;
  amenities?: string[];
}

export interface Room {
  _id?: string;
  id?: string;
  roomNumber: string;
  roomType?: RoomType;
  capacity: number;
  images?: string[];
  amenities?: string[];
  policies?: string;
  isActive?: boolean;
  status?: 'available' | 'booked';
  floor?: number;
  avgRating?: number;
}

export interface SearchResultItem {
  room: Room;
  totalPrice: number;
}

export interface SearchParams {
  checkIn: string | Date;
  checkOut: string | Date;
  guests: number;
  roomTypeId?: string;
}
