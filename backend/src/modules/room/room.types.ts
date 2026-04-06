import { Types } from 'mongoose';

export interface IRoomType {
  _id: string | Types.ObjectId;
  name: string;
  description: string;
  basePrice: number;
  amenities: string[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IRoom {
  _id: string | Types.ObjectId;
  roomNumber: string;
  roomType: string | Types.ObjectId | IRoomType;
  floor: number;
  capacity: number;
  images: string[];
  amenities: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPricingRule {
  _id: string | Types.ObjectId;
  roomType: string | Types.ObjectId;
  name: string;
  startDate: Date;
  endDate: Date;
  priceType: 'fixed' | 'percentage';
  value: number;
  applyWeekend: boolean;
  applyHolidays: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomRepository {
  findRoomById(id: string): Promise<IRoom | null>;
  findRoomTypeById(id: string): Promise<IRoomType | null>;
  findAllRooms(filter: any, options?: any): Promise<IRoom[]>;
  findAllRoomTypes(filter: any, options?: any): Promise<IRoomType[]>;
  createRoom(data: Partial<IRoom>): Promise<IRoom>;
  createRoomType(data: Partial<IRoomType>): Promise<IRoomType>;
  updateRoom(id: string, data: Partial<IRoom>): Promise<IRoom | null>;
  updateRoomType(id: string, data: Partial<IRoomType>): Promise<IRoomType | null>;
  countRooms(filter: any): Promise<number>;
  
  // PricingRules
  findPricingRules(filter: any): Promise<IPricingRule[]>;
  createPricingRule(data: Partial<IPricingRule>): Promise<IPricingRule>;
  deletePricingRule(id: string): Promise<boolean>;
}
