import { MongoRoomRepository } from './room.repository.js';
import { RoomService } from './room.service.js';
import { RoomController } from './room.controller.js';

const roomRepository = new MongoRoomRepository();
const roomService = new RoomService(roomRepository);
const roomController = new RoomController(roomService);

export { roomRepository, roomService, roomController };
