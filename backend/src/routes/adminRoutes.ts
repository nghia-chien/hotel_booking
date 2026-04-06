import express from 'express';
import { getDashboardStats, getAllUsers, updateUserRole, updateUserStatus, getCalendarBookings } from '../controllers/adminController.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

// DASHBOARD: Admin + Staff
router.get('/dashboard/stats', authorizeRoles('admin', 'staff'), getDashboardStats);
router.get('/bookings/calendar', authorizeRoles('admin', 'staff'), getCalendarBookings);

// USER MANAGEMENT: Admin Only
router.get('/users', authorizeRoles('admin'), getAllUsers);
router.patch('/users/:id/role', authorizeRoles('admin'), updateUserRole);
router.patch('/users/:id/status', authorizeRoles('admin'), updateUserStatus);

export default router;
