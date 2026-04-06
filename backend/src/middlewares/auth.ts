import { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';
import { verifyAccessToken } from '../utils/jwt.js';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication token missing' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token) as { sub: string };

    const user = await User.findById(decoded.sub).select('-password');
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({ success: false, message: 'Account is disabled. Please contact support.' });
      return;
    }

    (req as any).user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Please Login' });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
      return;
    }
    next();
  };
};
