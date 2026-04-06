import express, { Request, Response, NextFunction } from 'express';
import { bookingController } from '../modules/booking/index.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

// Public search API for customers
router.get('/search', bookingController.searchAvailableRooms);

// Customer bookings
router.post('/', authenticate, authorizeRoles('user', 'admin', 'staff'), bookingController.createBooking);
router.post('/:id/pay', authenticate, authorizeRoles('user', 'admin', 'staff'), bookingController.payBooking);
router.get('/me', authenticate, authorizeRoles('user', 'admin', 'staff'), bookingController.getMyBookings);
router.get('/:id', authenticate, authorizeRoles('user', 'admin', 'staff'), bookingController.getBookingById);
router.post('/:id/cancel', authenticate, authorizeRoles('user', 'admin', 'staff'), bookingController.cancelBooking);

// Admin/Staff booking management
router.get('/', authenticate, authorizeRoles('admin', 'staff'), bookingController.getAllBookings);

export default router;
