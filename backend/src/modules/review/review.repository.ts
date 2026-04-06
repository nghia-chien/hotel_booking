import { ReviewRepository, IReview } from './review.types.js';
import { ReviewModel } from './review.model.js';
import mongoose from 'mongoose';

export class MongoReviewRepository implements ReviewRepository {
  async findById(id: string): Promise<IReview | null> {
    const review = await ReviewModel.findById(id).populate('customer').populate('room');
    return review ? review.toObject() : null;
  }

  async find(filter: Record<string, any>, options: mongoose.QueryOptions = {}): Promise<IReview[]> {
    const reviews = await ReviewModel.find(filter, null, options).populate('customer').populate('room');
    return reviews.map((r) => r.toObject());
  }

  async create(data: Partial<IReview>): Promise<IReview> {
    const review = await ReviewModel.create(data);
    return review.toObject();
  }

  async update(id: string, data: Partial<IReview>): Promise<IReview | null> {
    const review = await ReviewModel.findByIdAndUpdate(id, data, { new: true });
    return review ? review.toObject() : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await ReviewModel.findByIdAndDelete(id);
    return !!result;
  }

  async count(filter: Record<string, any>): Promise<number> {
    return await ReviewModel.countDocuments(filter);
  }
}
