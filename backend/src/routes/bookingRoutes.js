import express from "express";
import {
  searchAvailableRooms,
  createBooking,
  payBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  checkIn,
  checkOut,
  getOccupancyReport,
  getPopularRoomTypes,
  getBookingById,
  generateInvoice
} from "../controllers/bookingController.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

// Public search API for customers
router.get("/search", searchAvailableRooms);

// Customer bookings
router.post("/", authenticate, authorizeRoles("user", "admin", "staff"), createBooking);
router.post("/:id/pay", authenticate, authorizeRoles("user", "admin", "staff"), payBooking);
router.get("/me", authenticate, authorizeRoles("user", "admin", "staff"), getMyBookings);
router.get("/:id", authenticate, authorizeRoles("user", "admin", "staff"), getBookingById);
router.get("/:id/invoice", authenticate, authorizeRoles("user", "admin", "staff"), generateInvoice);
router.post("/:id/cancel", authenticate, authorizeRoles("user", "admin", "staff"), cancelBooking);

// Admin/Staff booking management
router.get("/", authenticate, authorizeRoles("admin", "staff"), getAllBookings);
router.post("/:id/check-in", authenticate, authorizeRoles("admin", "staff"), checkIn);
router.post("/:id/check-out", authenticate, authorizeRoles("admin", "staff"), checkOut);

// Reports
router.get(
  "/reports/occupancy",
  authenticate,
  authorizeRoles("admin", "staff"),
  getOccupancyReport
);
router.get(
  "/reports/popular-room-types",
  authenticate,
  authorizeRoles("admin", "staff"),
  getPopularRoomTypes
);

export default router;

