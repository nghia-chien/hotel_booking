import Room from "../models/Room.js";
import RoomType from "../models/RoomType.js";
import {
  createRoomSchema,
  updateRoomSchema
} from "../validators/roomValidators.js";
import { buildPaginationOptions } from "../utils/pagination.js";
import { uploadBufferToCloudinary } from "../utils/cloudinary.js";
import { redisClient } from "../config/redis.js";
import logger from "../utils/logger.js";

const validate = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    const err = new Error("Validation error");
    err.statusCode = 400;
    err.errorCode = "VALIDATION_ERROR";
    err.details = error.details;
    throw err;
  }
  return value;
};

export const createRoom = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (req.files && req.files.length > 0) {
      body.images = await Promise.all(
        req.files.map((file) => uploadBufferToCloudinary(file))
      );
    }

    // Normalize amenities from multipart/form-data
    if (typeof body.amenities === "string") {
      try {
        const parsed = JSON.parse(body.amenities);
        if (Array.isArray(parsed)) {
          body.amenities = parsed;
        } else {
          body.amenities = String(body.amenities)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      } catch {
        body.amenities = String(body.amenities)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    const data = validate(createRoomSchema, body);

    const roomType = await RoomType.findById(data.roomType);
    if (!roomType) {
      const err = new Error("Invalid room type");
      err.statusCode = 400;
      err.errorCode = "INVALID_ROOM_TYPE";
      throw err;
    }

    const exists = await Room.findOne({ roomNumber: data.roomNumber });
    if (exists) {
      const err = new Error("Room number already exists");
      err.statusCode = 409;
      err.errorCode = "ROOM_NUMBER_EXISTS";
      throw err;
    }

    const room = await Room.create(data);
    
    // Invalidate caches
    try {
      await redisClient.del("rooms:all");
    } catch (redisErr) {
      logger.error("Redis delete error on createRoom", redisErr);
    }
    
    res.status(201).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

export const getRooms = async (req, res, next) => {
  try {
    const { page, limit, skip, sort } = buildPaginationOptions(req);
    const filter = {};

    if (req.query.roomType) {
      filter.roomType = req.query.roomType;
    }
    if (req.query.isActive) {
      filter.isActive = req.query.isActive === "true";
    }

    // Cache logic: only for page 1, limit default, no filter
    const isDefaultQuery = page === 1 && Object.keys(filter).length === 0;
    const cacheKey = "rooms:all";

    if (isDefaultQuery) {
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          logger.info("cache_hit", { cacheKey, requestId: req.requestId });
          return res.json({ success: true, ...JSON.parse(cached) });
        }
      } catch (redisErr) {
        logger.error("Redis get error", redisErr);
      }
    }

    const [items, total] = await Promise.all([
      Room.find(filter)
        .populate("roomType")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Room.countDocuments(filter)
    ]);

    const resultPayload = {
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    if (isDefaultQuery) {
      try {
        await redisClient.set(cacheKey, JSON.stringify(resultPayload), "EX", 300); // 5 min TTL
      } catch (redisErr) {
        logger.error("Redis set error", redisErr);
      }
    }

    res.json({
      success: true,
      ...resultPayload
    });
  } catch (error) {
    next(error);
  }
};

export const getRoomById = async (req, res, next) => {
  try {
    const roomId = req.params.id;
    const cacheKey = `room:${roomId}`;
    
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        logger.info("cache_hit", { cacheKey, requestId: req.requestId });
        return res.json({ success: true, data: JSON.parse(cached) });
      }
    } catch (redisErr) {
      logger.error("Redis get error", redisErr);
    }

    const room = await Room.findById(roomId).populate("roomType");
    if (!room) {
      const err = new Error("Room not found");
      err.statusCode = 404;
      err.errorCode = "ROOM_NOT_FOUND";
      throw err;
    }
    
    try {
      await redisClient.set(cacheKey, JSON.stringify(room), "EX", 300);
    } catch (redisErr) {
      logger.error("Redis set error", redisErr);
    }

    res.json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

export const updateRoom = async (req, res, next) => {
  try {
    const body = { ...req.body };
    const room = await Room.findById(req.params.id);
    if (!room) {
      const err = new Error("Room not found");
      err.statusCode = 404;
      err.errorCode = "ROOM_NOT_FOUND";
      throw err;
    }

    let updatedImages = [...(room.images || [])];

    // 1. Xử lý xóa ảnh nếu được yêu cầu
    if (body.imagesToDelete) {
      try {
        const toDelete = JSON.parse(body.imagesToDelete);
        if (Array.isArray(toDelete)) {
          updatedImages = updatedImages.filter(img => !toDelete.includes(img));
        }
      } catch (e) {
        console.error("Error parsing imagesToDelete", e);
      }
    }

    // 2. Xử lý upload ảnh mới (append)
    if (req.files && req.files.length > 0) {
      const newImages = await Promise.all(
        req.files.map((file) => uploadBufferToCloudinary(file))
      );
      updatedImages = [...updatedImages, ...newImages];
    }

    body.images = updatedImages;

    // Normalize amenities
    if (typeof body.amenities === "string") {
      try {
        const parsed = JSON.parse(body.amenities);
        body.amenities = Array.isArray(parsed) ? parsed : [];
      } catch {
        body.amenities = String(body.amenities).split(",").map(s => s.trim()).filter(Boolean);
      }
    }

    const data = validate(updateRoomSchema, body);

    if (data.roomType) {
      const roomType = await RoomType.findById(data.roomType);
      if (!roomType) {
        const err = new Error("Invalid room type");
        err.statusCode = 400;
        err.errorCode = "INVALID_ROOM_TYPE";
        throw err;
      }
    }

    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, data, {
      new: true
    }).populate("roomType");

    try {
      await redisClient.del(`room:${req.params.id}`);
      await redisClient.del("rooms:all");
    } catch (redisErr) {
      logger.error("Redis delete error on updateRoom", redisErr);
    }

    res.json({ success: true, data: updatedRoom });
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      const err = new Error("Room not found");
      err.statusCode = 404;
      err.errorCode = "ROOM_NOT_FOUND";
      throw err;
    }

    try {
      await redisClient.del(`room:${req.params.id}`);
      await redisClient.del("rooms:all");
    } catch (redisErr) {
      logger.error("Redis delete error on deleteRoom", redisErr);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

