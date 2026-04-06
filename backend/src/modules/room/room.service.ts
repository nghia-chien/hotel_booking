import { RoomRepository, IRoom, IRoomType, IPricingRule } from './room.types.js';
import { AppError } from '../../core/errors/AppError.js';
import { logger } from '../../core/utils/logger.js';
import { uploadBufferToCloudinary } from '../../utils/cloudinary.js';

export class RoomService {
  constructor(private readonly roomRepo: RoomRepository) {}

  async createRoom(data: any, files?: any[]): Promise<IRoom> {
    const body = { ...data };
    if (files && files.length > 0) {
      body.images = await Promise.all(
        files.map((file) => uploadBufferToCloudinary(file))
      );
    }

    if (typeof body.amenities === 'string') {
      try {
        const parsed = JSON.parse(body.amenities);
        body.amenities = Array.isArray(parsed) ? parsed : body.amenities.split(',').map((s: string) => s.trim()).filter(Boolean);
      } catch {
        body.amenities = body.amenities.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }

    const roomType = await this.roomRepo.findRoomTypeById(body.roomType);
    if (!roomType) throw new AppError('Invalid roomType', 400, 'INVALID_ROOM_TYPE');

    const exists = await this.roomRepo.findAllRooms({ roomNumber: body.roomNumber });
    if (exists.length > 0) throw new AppError('Room number already exists', 409, 'ROOM_EXISTS');

    const room = await this.roomRepo.createRoom(body);
    logger.info('Room created', { roomId: (room as any)._id, roomNumber: room.roomNumber });
    return room;
  }

  async getAllRooms(filter: any, options: any): Promise<{ items: IRoom[], total: number }> {
    const [items, total] = await Promise.all([
      this.roomRepo.findAllRooms(filter, options),
      this.roomRepo.countRooms(filter),
    ]);
    return { items, total };
  }

  async getRoomById(id: string): Promise<IRoom> {
    const room = await this.roomRepo.findRoomById(id);
    if (!room) throw new AppError('Room not found', 404, 'ROOM_NOT_FOUND');
    return room;
  }

  async updateRoom(id: string, data: any, files?: any[]): Promise<IRoom> {
    const room = await this.roomRepo.findRoomById(id);
    if (!room) throw new AppError('Room not found', 404, 'ROOM_NOT_FOUND');

    let updatedImages = [...(room.images || [])];
    if (data.imagesToDelete) {
      try {
        const toDelete = JSON.parse(data.imagesToDelete);
        if (Array.isArray(toDelete)) {
          updatedImages = updatedImages.filter(img => !toDelete.includes(img));
        }
      } catch (e) {
        logger.error('Error parsing imagesToDelete', { error: (e as Error).message });
      }
    }

    if (files && files.length > 0) {
      const newImages = await Promise.all(
        files.map((file) => uploadBufferToCloudinary(file))
      );
      updatedImages = [...updatedImages, ...newImages];
    }

    const body = { ...data, images: updatedImages };
    if (typeof body.amenities === 'string') {
      try {
        const parsed = JSON.parse(body.amenities);
        body.amenities = Array.isArray(parsed) ? parsed : body.amenities.split(',').map((s: string) => s.trim()).filter(Boolean);
      } catch {
        body.amenities = body.amenities.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }

    const updatedRoom = await this.roomRepo.updateRoom(id, body);
    if (!updatedRoom) throw new AppError('Failed to update room', 500);
    
    logger.info('Room updated', { roomId: id });
    return updatedRoom;
  }

  async deleteRoom(id: string): Promise<void> {
    const room = await this.roomRepo.findRoomById(id);
    if (!room) throw new AppError('Room not found', 404, 'ROOM_NOT_FOUND');
    await this.roomRepo.updateRoom(id, { isActive: false }); // Soft delete or actual delete? Old code used findByIdAndDelete.
    // Actually old code used findByIdAndDelete:
    // const room = await Room.findByIdAndDelete(req.params.id);
  }

  // RoomType methods
  async getAllRoomTypes(): Promise<IRoomType[]> {
    return await this.roomRepo.findAllRoomTypes({});
  }

  async createRoomType(data: any): Promise<IRoomType> {
    return await this.roomRepo.createRoomType(data);
  }

  // PricingRule methods
  async getPricingRules(roomTypeId: string): Promise<IPricingRule[]> {
    return await this.roomRepo.findPricingRules({ roomType: roomTypeId });
  }

  async createPricingRule(data: any): Promise<IPricingRule> {
    return await this.roomRepo.createPricingRule(data);
  }
}
