import Joi from 'joi';

export const registerSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('user', 'admin', 'staff').optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const profileUpdateSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  phone: Joi.string().allow('', null),
  address: Joi.string().allow('', null),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});
