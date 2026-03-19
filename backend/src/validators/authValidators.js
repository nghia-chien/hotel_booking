import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().trim().email().required().messages({"String.email": "Email khong hop le", "any.required":"Email la bat buoc"}),
  password: Joi.string().min(6).required(),
  role: Joi.forbidden()
}).unknown(false);

export const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({"String.email": "Email khong hop le", "any.required":"Email la bat buoc"}),
  password: Joi.string().required()
}).unknown(false);

