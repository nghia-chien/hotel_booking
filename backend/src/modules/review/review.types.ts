import { Types } from 'mongoose';

export interface IReview {
  _id: string | Types.ObjectId;
  booking: string | Types.ObjectId;
  customer: string | Types.ObjectId;
  room: string | Types.ObjectId;
  rating: number;
  comment: string;
  images: string[];
  reply?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewRepository {
  findById(id: string): Promise<IReview | null>;
  find(filter: any, options?: any): Promise<IReview[]>;
  create(data: Partial<IReview>): Promise<IReview>;
  update(id: string, data: Partial<IReview>): Promise<IReview | null>;
  delete(id: string): Promise<boolean>;
  count(filter: any): Promise<number>;
}
