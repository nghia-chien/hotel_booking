import { UserRepository, IUser } from './auth.types.js';
import { UserModel } from './user.model.js';
import mongoose from 'mongoose';

export class MongoUserRepository implements UserRepository {
  async findById(id: string): Promise<IUser | null> {
    const user = await UserModel.findById(id);
    return user ? user.toObject() : null;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const user = await UserModel.findOne({ email });
    return user ? user.toObject() : null;
  }

  async create(data: Partial<IUser>): Promise<IUser> {
    const user = await UserModel.create(data);
    return user.toObject();
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    const user = await UserModel.findByIdAndUpdate(id, data, { new: true });
    return user ? user.toObject() : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }

  async find(filter: Record<string, any>, options: Record<string, any> = {}): Promise<IUser[]> {
    const users = await UserModel.find(filter, null, options);
    return users.map((u) => u.toObject());
  }
}
