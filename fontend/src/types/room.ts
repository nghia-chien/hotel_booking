export interface RoomType {
  _id: string
  name: string
  basePrice: number;
  description?: string;
}
export interface RoomTypeAdmin extends RoomType {
  defaultCapacity: number
}

export interface ListResponse<T> {
  success: boolean;
  data: T[];
}
export interface Room {
  _id: string
  roomNumber: string
  capacity: number
  roomType: RoomType
  images?: string[]
  amenities?: string[]
  policies?: string
  isActive: boolean
}

export interface RoomResponse {
  success: boolean;
  data: Room;
}

export interface SearchResultItem {
  room: Room
  totalPrice: number
}

export interface SearchResponse {
  success: boolean
  data: SearchResultItem[]
}

export interface CreateBookingPayload {
  roomId: string
  checkIn: string
  checkOut: string
  guests: number
  specialRequest?: string
}