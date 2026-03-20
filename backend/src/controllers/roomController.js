import Room from "../models/Room.js";
import RoomType from "../models/RoomType.js";
import {
  createRoomSchema,
  updateRoomSchema
} from "../validators/roomValidators.js";
import { buildPaginationOptions } from "../utils/pagination.js";
import { uploadBufferToCloudinary } from "../utils/cloudinary.js";

const validate = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    const err = new Error("Validation error");
    err.statusCode = 400;
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
      return res.status(400).json({
        success: false,
        message: "Invalid roomType"
      });
    }

    const exists = await Room.findOne({ roomNumber: data.roomNumber });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Room number already exists"
      });
    }

    const room = await Room.create(data);
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

    const [items, total] = await Promise.all([
      Room.find(filter)
        .populate("roomType")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Room.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate("roomType");
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }
    res.json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

export const updateRoom = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (req.files && req.files.length > 0) {
      body.images = await Promise.all(
        req.files.map((file) => uploadBufferToCloudinary(file))
      );
    }

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

    const data = validate(updateRoomSchema, body);
    // Nếu không upload ảnh mới, giữ nguyên ảnh hiện tại (tránh Joi default [] xóa ảnh)
    if (!req.files || req.files.length === 0) {
      delete data.images;
    }

    if (data.roomType) {
      const roomType = await RoomType.findById(data.roomType);
      if (!roomType) {
        return res.status(400).json({
          success: false,
          message: "Invalid roomType"
        });
      }
    }

    const room = await Room.findByIdAndUpdate(req.params.id, data, {
      new: true
    }).populate("roomType");

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    res.json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

