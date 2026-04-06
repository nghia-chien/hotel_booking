import { Types } from 'mongoose';

export type UserRole = 'user' | 'admin' | 'staff';

export interface IUser {
  _id: string | Types.ObjectId;
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRepository {
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  create(data: Partial<IUser>): Promise<IUser>;
  update(id: string, data: Partial<IUser>): Promise<IUser | null>;
  delete(id: string): Promise<boolean>;
  find(filter: any, options?: any): Promise<IUser[]>;
}
