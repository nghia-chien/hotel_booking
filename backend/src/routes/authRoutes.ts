import express from 'express';
import { authController } from '../modules/auth/index.js';
import { authenticate } from '../middlewares/auth.js';
import { avatarUpload } from '../utils/multer.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.use(authenticate);
router.put('/profile', authController.updateProfile);
router.put('/change-password', authController.changePassword);
router.post('/avatar', avatarUpload.single('avatar'), authController.uploadAvatar);

export default router;
