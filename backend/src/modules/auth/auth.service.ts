import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { UserRepository, IUser } from './auth.types.js';
import { AppError } from '../../core/errors/AppError.js';
import { logger } from '../../core/utils/logger.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt.js';

export class AuthService {
  constructor(private readonly userRepo: UserRepository) {}

  async register(data: any): Promise<{ user: Partial<IUser>, accessToken: string, refreshToken: string }> {
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) {
      throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const user = await this.userRepo.create({
      fullName: data.fullName,
      email: data.email,
      password: hashedPassword,
      role: data.role || 'user',
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    logger.info('User registered', { userId: (user as any)._id });

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async login(data: any): Promise<{ user: Partial<IUser>, accessToken: string, refreshToken: string }> {
    const user = await this.userRepo.findByEmail(data.email);
    if (!user || !user.password) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    logger.info('User logged in', { userId: (user as any)._id });

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    if (!token) {
      throw new AppError('refreshToken is required', 400, 'TOKEN_REQUIRED');
    }

    const decoded: any = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_REFRESH_SECRET || '', (err, payload) => {
        if (err) reject(new AppError('Invalid refresh token', 401, 'INVALID_TOKEN'));
        else resolve(payload);
      });
    });

    const user = await this.userRepo.findById(decoded.sub);
    if (!user) {
      throw new AppError('User not found', 401, 'USER_NOT_FOUND');
    }

    const accessToken = generateAccessToken(user);
    return { accessToken };
  }

  async forgotPassword(email: string): Promise<{ resetToken: string, expires: Date }> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      // Don't leak exists status, but return mock data for demo
      return { resetToken: 'demo', expires: new Date() };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await this.userRepo.update((user as any)._id.toString(), {
      resetPasswordToken: resetToken,
      resetPasswordExpires: expires,
    });

    return { resetToken, expires };
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const users = await this.userRepo.find({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (users.length === 0) {
      throw new AppError('Invalid or expired reset token', 400, 'INVALID_TOKEN');
    }

    const user = users[0];
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.userRepo.update((user as any)._id.toString(), {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });
  }

  async updateProfile(userId: string, data: any): Promise<Partial<IUser>> {
    const user = await this.userRepo.update(userId, {
      fullName: data.fullName,
      phone: data.phone,
      address: data.address,
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return this.sanitizeUser(user);
  }

  async changePassword(userId: string, data: any): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user || !user.password) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) {
      throw new AppError('Mật khẩu hiện tại không đúng', 401, 'INVALID_PASSWORD');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.newPassword, salt);

    await this.userRepo.update(userId, { password: hashedPassword });
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<void> {
    const user = await this.userRepo.update(userId, { avatar: avatarUrl });
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  private sanitizeUser(user: IUser): Partial<IUser> {
    const { password, resetPasswordToken, resetPasswordExpires, ...rest } = user as any;
    return {
      id: rest._id,
      ...rest,
    };
  }
}
