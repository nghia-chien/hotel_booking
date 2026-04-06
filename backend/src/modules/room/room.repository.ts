import { RoomRepository, IRoom, IRoomType, IPricingRule } from './room.types.js';
import { RoomModel } from './room.model.js';
import { RoomTypeModel } from './room-type.model.js';
import mongoose from 'mongoose';

// Adding PricingRule model here for module consolidation
interface PricingRuleDocument extends IPricingRule, mongoose.Document {
  _id: mongoose.Types.ObjectId;
}

const pricingRuleSchema = new mongoose.Schema<PricingRuleDocument>(
  {
    roomType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoomType',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      required: true,
      index: true,
    },
    priceType: {
      type: String,
      enum: ['fixed', 'percentage'],
      default: 'percentage',
    },
    value: {
      type: Number,
      required: true,
    },
    applyWeekend: {
      type: Boolean,
      default: false,
    },
    applyHolidays: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

pricingRuleSchema.index({ roomType: 1, startDate: 1, endDate: 1 });

const PricingRuleModel = mongoose.model<PricingRuleDocument>('PricingRule', pricingRuleSchema);

export class MongoRoomRepository implements RoomRepository {
  async findRoomById(id: string): Promise<IRoom | null> {
    const room = await RoomModel.findById(id).populate('roomType');
    return room ? room.toObject() : null;
  }

  async findRoomTypeById(id: string): Promise<IRoomType | null> {
    const roomType = await RoomTypeModel.findById(id);
    return roomType ? roomType.toObject() : null;
  }

  async findAllRooms(filter: Record<string, any>, options: Record<string, any> = {}): Promise<IRoom[]> {
    const rooms = await RoomModel.find(filter, null, options).populate('roomType');
    return rooms.map((r) => r.toObject());
  }

  async findAllRoomTypes(filter: Record<string, any>, options: Record<string, any> = {}): Promise<IRoomType[]> {
    const roomTypes = await RoomTypeModel.find(filter, null, options);
    return roomTypes.map((rt) => rt.toObject());
  }

  async createRoom(data: Partial<IRoom>): Promise<IRoom> {
    const room = await RoomModel.create(data);
    return room.toObject();
  }

  async createRoomType(data: Partial<IRoomType>): Promise<IRoomType> {
    const roomType = await RoomTypeModel.create(data);
    return roomType.toObject();
  }

  async updateRoom(id: string, data: Partial<IRoom>): Promise<IRoom | null> {
    const room = await RoomModel.findByIdAndUpdate(id, data, { new: true }).populate('roomType');
    return room ? room.toObject() : null;
  }

  async updateRoomType(id: string, data: Partial<IRoomType>): Promise<IRoomType | null> {
    const roomType = await RoomTypeModel.findByIdAndUpdate(id, data, { new: true });
    return roomType ? roomType.toObject() : null;
  }

  async countRooms(filter: Record<string, any>): Promise<number> {
    return await RoomModel.countDocuments(filter);
  }

  // PricingRules
  async findPricingRules(filter: Record<string, any>): Promise<IPricingRule[]> {
    const rules = await PricingRuleModel.find(filter);
    return rules.map((r) => r.toObject());
  }

  async createPricingRule(data: Partial<IPricingRule>): Promise<IPricingRule> {
    const rule = await PricingRuleModel.create(data);
    return rule.toObject();
  }

  async deletePricingRule(id: string): Promise<boolean> {
    const result = await PricingRuleModel.findByIdAndDelete(id);
    return !!result;
  }
}
