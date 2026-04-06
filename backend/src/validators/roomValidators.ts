import Joi from 'joi';

export const createRoomSchema = Joi.object({
  roomNumber: Joi.string().min(1).required(),
  roomType: Joi.string().hex().length(24).required(),
  capacity: Joi.number().integer().min(1).required(),
  amenities: Joi.array().items(Joi.string()).default([]),
  policies: Joi.string().allow('', null),
  images: Joi.array().items(Joi.string()).default([]),
  isActive: Joi.boolean().default(true),
});

export const updateRoomSchema = createRoomSchema.fork(
  ['roomNumber', 'roomType', 'capacity'],
  (schema) => schema.optional()
);
