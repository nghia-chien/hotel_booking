import RoomType from "../models/RoomType.js";
import {
  createRoomTypeSchema,
  updateRoomTypeSchema
} from "../validators/roomTypeValidators.js";
import { buildPaginationOptions } from "../utils/pagination.js";

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

export const createRoomType = async (req, res, next) => {
  try {
    const data = validate(createRoomTypeSchema, req.body);
    const exists = await RoomType.findOne({ name: data.name });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Room type name already exists"
      });
    }

    const roomType = await RoomType.create(data);
    res.status(201).json({ success: true, data: roomType });
  } catch (error) {
    next(error);
  }
};

export const getRoomTypes = async (req, res, next) => {
  try {
    const { page, limit, skip, sort } = buildPaginationOptions(req);
    const filter = {};

    if (req.query.name) {
      filter.name = { $regex: req.query.name, $options: "i" };
    }

    const [items, total] = await Promise.all([
      RoomType.find(filter).sort(sort).skip(skip).limit(limit),
      RoomType.countDocuments(filter)
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

export const getRoomTypeById = async (req, res, next) => {
  try {
    const roomType = await RoomType.findById(req.params.id);
    if (!roomType) {
      return res.status(404).json({
        success: false,
        message: "Room type not found"
      });
    }
    res.json({ success: true, data: roomType });
  } catch (error) {
    next(error);
  }
};

export const updateRoomType = async (req, res, next) => {
  try {
    const data = validate(updateRoomTypeSchema, req.body);

    const roomType = await RoomType.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    );

    if (!roomType) {
      return res.status(404).json({
        success: false,
        message: "Room type not found"
      });
    }

    res.json({ success: true, data: roomType });
  } catch (error) {
    next(error);
  }
};

export const deleteRoomType = async (req, res, next) => {
  try {
    const roomType = await RoomType.findByIdAndDelete(req.params.id);
    if (!roomType) {
      return res.status(404).json({
        success: false,
        message: "Room type not found"
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

