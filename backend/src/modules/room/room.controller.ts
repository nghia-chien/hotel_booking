import { Request, Response, NextFunction } from 'express';
import { RoomService } from './room.service.js';
import { buildPaginationOptions } from '../../utils/pagination.js';

export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  public createRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as any[];
      const result = await this.roomService.createRoom(req.body, files);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public getRooms = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, skip, sort } = buildPaginationOptions(req);
      const filter: any = {};
      if (req.query.roomType) filter.roomType = req.query.roomType as string;
      if (req.query.isActive) filter.isActive = (req.query.isActive as string) === 'true';

      const { items, total } = await this.roomService.getAllRooms(filter, { skip, limit, sort });
      res.json({
        success: true,
        data: items,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
      });
    } catch (error) {
      next(error);
    }
  };

  public getRoomById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.roomService.getRoomById(req.params.id as string);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public updateRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as any[];
      const result = await this.roomService.updateRoom(req.params.id as string, req.body, files);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public deleteRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.roomService.deleteRoom(req.params.id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  // RoomType controllers
  public getAllRoomTypes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.roomService.getAllRoomTypes();
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public createRoomType = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.roomService.createRoomType(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  // PricingRule controllers
  public getPricingRules = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roomTypeId = req.query.roomType as string;
      const result = await this.roomService.getPricingRules(roomTypeId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public createPricingRule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.roomService.createPricingRule(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
