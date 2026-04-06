import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { loginSchema, registerSchema, profileUpdateSchema, changePasswordSchema } from '../validators/authValidators.js';
import { uploadBufferToCloudinary } from '../utils/cloudinary.js';
import Joi from 'joi';

const validate = <T>(schema: Joi.Schema, data: unknown): T => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    const err: any = new Error('Validation error');
    err.statusCode = 400;
    err.details = error.details;
    throw err;
  }
  return value as T;
};

const userResponse = (user: any) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  phone: user.phone,
  address: user.address,
});

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = validate<any>(registerSchema, req.body);

    const existing = await User.findOne({ email: data.email });
    if (existing) {
      res.status(409).json({ success: false, message: 'Email already registered' });
      return;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await User.create({ fullName: data.fullName, email: data.email, password: hashedPassword, role: data.role || 'user' });

    res.status(201).json({
      success: true,
      data: { user: userResponse(user), accessToken: generateAccessToken(user), refreshToken: generateRefreshToken(user) },
    });
  } catch (error) { next(error); }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = validate<any>(loginSchema, req.body);
    const user = await User.findOne({ email: data.email });
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    res.json({
      success: true,
      data: { user: userResponse(user), accessToken: generateAccessToken(user), refreshToken: generateRefreshToken(user) },
    });
  } catch (error) { next(error); }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) { res.status(400).json({ success: false, message: 'refreshToken is required' }); return; }

    const decoded = await new Promise<any>((resolve, reject) => {
      jwt.verify(token, process.env.JWT_REFRESH_SECRET as string, (err: any, payload: any) => {
        if (err) reject(err); else resolve(payload);
      });
    });

    const user = await User.findById(decoded.sub);
    if (!user) { res.status(401).json({ success: false, message: 'User not found' }); return; }

    res.json({ success: true, data: { accessToken: generateAccessToken(user) } });
  } catch (error) { next(error); }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) { res.status(400).json({ success: false, message: 'Email is required' }); return; }

    const user = await User.findOne({ email });
    if (!user) {
      res.json({ success: true, message: 'If that email exists, reset instructions have been sent' });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = expires;
    await user.save();

    res.json({ success: true, data: { resetToken, expires } });
  } catch (error) { next(error); }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      res.status(400).json({ success: false, message: 'token and newPassword are required' });
      return;
    }

    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: new Date() } });
    if (!user) { res.status(400).json({ success: false, message: 'Invalid or expired reset token' }); return; }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) { next(error); }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = validate<any>(profileUpdateSchema, req.body);
    const reqUser = (req as any).user;
    const user = await User.findById(reqUser._id);
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }

    user.fullName = data.fullName;
    user.phone = data.phone;
    user.address = data.address;
    await user.save();

    res.json({ success: true, data: { user: userResponse(user) } });
  } catch (error) { next(error); }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = validate<any>(changePasswordSchema, req.body);
    const reqUser = (req as any).user;
    const user = await User.findById(reqUser._id);
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }

    if (!(await bcrypt.compare(data.currentPassword, user.password))) {
      res.status(401).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
      return;
    }

    user.password = await bcrypt.hash(data.newPassword, 10);
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) { next(error); }
};

export const uploadAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) { res.status(400).json({ success: false, message: 'No file uploaded' }); return; }

    const avatarUrl = await uploadBufferToCloudinary(req.file, 'hotel-booking/avatars', 'avatar');
    const reqUser = (req as any).user;
    const user = await User.findById(reqUser._id);
    if (user) { user.avatar = avatarUrl; await user.save(); }

    res.json({ success: true, data: { avatarUrl } });
  } catch (error) { next(error); }
};
