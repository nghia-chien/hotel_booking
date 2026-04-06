import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { logger } from '../../core/utils/logger.js';
import { uploadBufferToCloudinary } from '../../utils/cloudinary.js';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.login(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.refreshToken(req.body.refreshToken);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.forgotPassword(req.body.email);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.authService.resetPassword(req.body.token, req.body.newPassword);
      res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
      next(error);
    }
  };

  public updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user._id;
      const result = await this.authService.updateProfile(userId, req.body);
      res.json({ success: true, data: { user: result } });
    } catch (error) {
      next(error);
    }
  };

  public changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user._id;
      await this.authService.changePassword(userId, req.body);
      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  };

  public uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      const avatarUrl = await uploadBufferToCloudinary(req.file, 'hotel-booking/avatars', 'avatar');
      const userId = (req as any).user._id;
      await this.authService.updateAvatar(userId, avatarUrl);
      res.json({ success: true, data: { avatarUrl } });
    } catch (error) {
      next(error);
    }
  };
}
