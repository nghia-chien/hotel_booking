import Joi from "joi";

export const createRoomTypeSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().allow("", null),
  basePrice: Joi.number().min(0).required(),
  defaultCapacity: Joi.number().integer().min(1).required()
}).unknown(false);

export const updateRoomTypeSchema = createRoomTypeSchema.fork(
  ["name", "basePrice", "defaultCapacity"],
  (schema) => schema.optional()
).unknown(false);

