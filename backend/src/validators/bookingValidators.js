import Joi from "joi";

export const createBookingSchema = Joi.object({
  roomId: Joi.string().hex().length(24).required(),
  checkIn: Joi.date().iso().required(),
  checkOut: Joi.date().iso().greater(Joi.ref("checkIn")).required(),
  guests: Joi.number().integer().min(1).required(),
  specialRequest: Joi.string().allow("", null)
}).unknown(false);

export const searchRoomsSchema = Joi.object({
  checkIn: Joi.date().iso().required(),
  checkOut: Joi.date().iso().greater(Joi.ref("checkIn")).required(),
  guests: Joi.number().integer().min(1).required(),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  roomType: Joi.string().hex().length(24),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string()
}).unknown(false);

