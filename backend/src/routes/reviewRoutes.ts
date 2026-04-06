import express from 'express';
import { reviewController } from '../modules/review/index.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

// Public / User routes
router.get('/room/:id', reviewController.getRoomReviews);
router.get('/check/:bookingId', authenticate, reviewController.checkReviewStatus);
router.post('/', authenticate, reviewController.createReview);

// Admin routes
router.get('/admin/all', authenticate, authorizeRoles('admin', 'staff'), reviewController.getAllReviewsAdmin);
router.patch('/admin/:id/visibility', authenticate, authorizeRoles('admin'), reviewController.toggleVisibility);

export default router;
