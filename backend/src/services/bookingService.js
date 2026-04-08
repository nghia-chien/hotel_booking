import {
  createBooking,
  findBookingById,
  findBookingsByFilter,
  countBookings,
  updateBookingStatus,
  findExpiredPendingBookings,
  existsOverlappingBooking
} from "../repositories/bookingRepository.js";
import { findRoomById, findRoomsByFilter } from "../repositories/roomRepository.js";
import { buildPaginationOptions } from "../utils/pagination.js";
import { calculateBookingPrice } from "../utils/pricing.js";
import { createNotification } from "../utils/notificationHelper.js";
import Payment from "../models/Payment.js"; // Temporarily until payment repo created
import { format } from "date-fns";

const CANCELLATION_HOURS = 24;
const DEFAULT_REFUND_PERCENTAGE = 100;

/**
 * Service to handle room search with availability and pricing
 */
export const searchAvailableRoomsService = async (query) => {
  const { page, limit, skip, sort } = buildPaginationOptions({ query });

  const roomFilter = {
    isActive: true,
    capacity: { $gte: query.guests }
  };
  if (query.roomType) roomFilter.roomType = query.roomType;

  const allRooms = await findRoomsByFilter(roomFilter);
  const roomIds = allRooms.map((r) => r._id);

  if (!roomIds.length) {
    return { data: [], meta: { page, limit, total: 0, totalPages: 0 } };
  }

  // Find rooms already booked in the period
  // NOTE: Logic moved to Repository if we want to search all room availability efficiently,
  // but for now we keep it here to combine with room objects.
  const overlappingFilter = {
    room: { $in: roomIds },
    status: { $in: ["Pending", "Paid", "CheckedIn"] },
    checkIn: { $lt: query.checkOut },
    checkOut: { $gt: query.checkIn }
  };

  // Re-importing model for direct aggregation if needed, or stick to repo for now
  // For better scaling, this complex query should eventually move to repository
  const { default: BookingModel } = await import("../models/Booking.js");
  const overlappingBookings = await BookingModel.find(overlappingFilter).select("room");

  const bookedRoomIds = new Set(overlappingBookings.map((b) => b.room.toString()));
  const availableRooms = allRooms.filter((r) => !bookedRoomIds.has(r._id.toString()));

  const checkIn = new Date(query.checkIn);
  const checkOut = new Date(query.checkOut);

  let filtered = await Promise.all(
    availableRooms.map(async (room) => {
      const totalPrice = await calculateBookingPrice(room.roomType._id, checkIn, checkOut);
      return { room, totalPrice };
    })
  );

  if (query.minPrice != null) filtered = filtered.filter((r) => r.totalPrice >= query.minPrice);
  if (query.maxPrice != null) filtered = filtered.filter((r) => r.totalPrice <= query.maxPrice);

  const sortKeys = Object.keys(sort);
  if (sortKeys.length) {
    filtered.sort((a, b) => {
      for (const key of sortKeys) {
        const dir = sort[key];
        const aVal = key === "totalPrice" ? a.totalPrice : a.room[key];
        const bVal = key === "totalPrice" ? b.totalPrice : b.room[key];
        if (aVal < bVal) return -1 * dir;
        if (aVal > bVal) return 1 * dir;
      }
      return 0;
    });
  }

  const total = filtered.length;
  const data = filtered.slice(skip, skip + limit).map(({ room, totalPrice }) => ({ room, totalPrice }));

  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

/**
 * Create a new booking in PENDING state
 */
export const createBookingService = async (data, userId) => {
  const room = await findRoomById(data.roomId);

  if (!room || !room.isActive) {
    const err = new Error("Invalid or inactive room");
    err.statusCode = 400;
    err.errorCode = "ROOM_NOT_AVAILABLE";
    throw err;
  }

  if (data.guests > room.capacity) {
    const err = new Error("Guests exceed room capacity");
    err.statusCode = 400;
    err.errorCode = "GUESTS_EXCEED_CAPACITY";
    throw err;
  }

  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);
  if (checkOut <= checkIn) {
    const err = new Error("Check-out must be after check-in");
    err.statusCode = 400;
    err.errorCode = "INVALID_DATES";
    throw err;
  }

  const conflict = await existsOverlappingBooking(room._id, checkIn, checkOut);
  if (conflict) {
    const err = new Error("Room is already booked for the selected dates");
    err.statusCode = 409;
    err.errorCode = "ROOM_OCCUPIED";
    throw err;
  }

  const totalPrice = await calculateBookingPrice(room.roomType._id, checkIn, checkOut);
  const cancellationDeadline = new Date(checkIn.getTime() - CANCELLATION_HOURS * 60 * 60 * 1000);

  const booking = await createBooking({
    customer: userId,
    room: room._id,
    roomType: room.roomType._id,
    checkIn,
    checkOut,
    guests: data.guests,
    totalPrice,
    status: "Pending",
    paymentStatus: "Pending",
    specialRequest: data.specialRequest,
    cancellationDeadline,
    refundPercentage: DEFAULT_REFUND_PERCENTAGE
  });

  return booking;
};

/**
 * Handle successful payment update to PAID
 */
export const processPaymentSuccess = async (bookingId, transactionId) => {
  const booking = await updateBookingStatus(bookingId, "Paid", "Paid");
  if (booking) {
    void createNotification(booking.customer, "payment_success", {
      transactionId,
      amount: booking.totalPrice,
      bookingId: booking._id
    });
    void createNotification(booking.customer, "booking_confirmed", {
      roomName: booking.room?.roomNumber || "Phòng",
      checkIn: format(new Date(booking.checkIn), "dd/MM/yyyy"),
      totalPrice: booking.totalPrice,
      bookingId: booking._id
    });
  }
  return booking;
};

/**
 * Standard business logic for cancellation with refund calculation
 */
export const cancelBookingService = async (bookingId, userId, userRole, reason = "") => {
  const booking = await findBookingById(bookingId);
  if (!booking) {
    const err = new Error("Booking not found");
    err.statusCode = 404;
    err.errorCode = "BOOKING_NOT_FOUND";
    throw err;
  }

  if (!booking.customer._id.equals(userId) && userRole === "user") {
    const err = new Error("You can only cancel your own bookings");
    err.statusCode = 403;
    err.errorCode = "ACCESS_DENIED";
    throw err;
  }

  if (!["Pending", "Paid"].includes(booking.status)) {
    const err = new Error("Only pending or paid bookings can be cancelled");
    err.statusCode = 400;
    err.errorCode = "INVALID_STATUS_FOR_CANCEL";
    throw err;
  }

  const now = new Date();
  const wasAlreadyPaid = booking.paymentStatus === "Paid";
  const refundPercentage = booking.refundPercentage || 100;
  const refundedAmount = wasAlreadyPaid ? (booking.totalPrice * refundPercentage) / 100 : 0;

  booking.status = "Cancelled";
  booking.paymentStatus = wasAlreadyPaid && refundedAmount > 0 ? "Refunded" : (wasAlreadyPaid ? "Paid" : "Failed");
  booking.cancelledAt = now;
  booking.refundedAmount = refundedAmount;
  await booking.save();

  // Notify cancellation
  void createNotification(booking.customer, "booking_cancelled", {
    roomName: booking.room?.roomNumber || "Phòng",
    bookingId: booking._id,
    reason: reason || (userRole !== "user" ? "Huỷ bởi quản trị viên" : "Huỷ theo yêu cầu")
  });

  return { booking, refundedAmount };
};

/**
 * Background task to find and expire old PENDING bookings
 */
export const expireOldBookingsService = async () => {
  const expiredBookings = await findExpiredPendingBookings(10); // 10 minutes hold
  const results = [];

  for (const booking of expiredBookings) {
    booking.status = "Expired";
    await booking.save();
    results.push(booking._id);

    // Cancel related PENDING payments
    await Payment.updateMany(
      {
        $or: [{ booking: booking._id }, { bookings: booking._id }],
        status: "PENDING"
      },
      {
        $set: { 
          status: "FAILED", 
          "metadata.failureReason": "Booking expired due to timeout" 
        }
      }
    );

    void createNotification(booking.customer, "booking_expired", {
      roomName: "Mã phòng " + (booking.room?.roomNumber || ""),
      bookingId: booking._id
    });
  }

  return results;
};

/**
 * Generic fetchers using Repository
 */
export const getMyBookingsService = async (req) => {
  const { page, limit, skip, sort } = buildPaginationOptions(req);
  const filter = { customer: req.user._id };
  const [items, total] = await Promise.all([
    findBookingsByFilter(filter, sort, skip, limit),
    countBookings(filter)
  ]);
  return { data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getAllBookingsService = async (req) => {
  const { page, limit, skip, sort } = buildPaginationOptions(req);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const [items, total] = await Promise.all([
    findBookingsByFilter(filter, sort, skip, limit),
    countBookings(filter)
  ]);
  return { data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const checkInService = async (id) => {
  const booking = await findBookingById(id);
  if (!booking || booking.status !== "Paid") {
    const err = new Error("Only paid bookings can be checked in");
    err.statusCode = 400;
    err.errorCode = "INVALID_STATUS_FOR_CHECKIN";
    throw err;
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const checkInDayStart = new Date(booking.checkIn);
  checkInDayStart.setHours(0, 0, 0, 0);

  if (todayStart.getTime() !== checkInDayStart.getTime()) {
    const isEarly = todayStart < checkInDayStart;
    const err = new Error(
      isEarly
        ? `Chưa tới ngày Check-in (${checkInDayStart.toLocaleDateString("vi-VN")})`
        : `Đã quá ngày Check-in (${checkInDayStart.toLocaleDateString("vi-VN")}). Vui lòng liên hệ quản lý.`
    );
    err.statusCode = 400;
    err.errorCode = isEarly ? "CHECKIN_TOO_EARLY" : "CHECKIN_TOO_LATE";
    throw err;
  }

  return await updateBookingStatus(id, "CheckedIn");
};

export const checkOutService = async (id) => {
  const booking = await findBookingById(id);
  if (!booking || booking.status !== "CheckedIn") {
    const err = new Error("Only checked-in bookings can be checked out");
    err.statusCode = 400;
    err.errorCode = "INVALID_STATUS_FOR_CHECKOUT";
    throw err;
  }

  const now = new Date();
  const checkOutDate = new Date(booking.checkOut);
  if (now < new Date(checkOutDate.setHours(0, 0, 0, 0))) {
    const err = new Error("Chưa tới ngày Check-out, nếu khách muốn trả phòng sớm vui lòng đổi ngày trả phòng.");
    err.statusCode = 400;
    err.errorCode = "CHECKOUT_TOO_EARLY";
    throw err;
  }

  return await updateBookingStatus(id, "CheckedOut");
};

export const getOccupancyReportService = async (startDate, endDate) => {
  const { default: BookingModel } = await import("../models/Booking.js");
  const { default: RoomModel } = await import("../models/Room.js");

  const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59, 999);

  const totalRooms = await RoomModel.countDocuments({ isActive: true });

  // Bookings that overlap with the date range
  const bookings = await BookingModel.find({
    status: { $in: ["Paid", "CheckedIn", "CheckedOut"] },
    checkIn: { $lt: end },
    checkOut: { $gt: start }
  }).select("checkIn checkOut room");

  // Build day-by-day occupancy
  const days = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);

  while (cursor <= endDay) {
    const dayStart = new Date(cursor);
    const dayEnd = new Date(cursor);
    dayEnd.setHours(23, 59, 59, 999);

    const occupiedRooms = new Set(
      bookings
        .filter(b => new Date(b.checkIn) < dayEnd && new Date(b.checkOut) > dayStart)
        .map(b => b.room?.toString())
    ).size;

    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 1000) / 10 : 0;

    days.push({
      date: cursor.toISOString().split("T")[0],
      occupiedRooms,
      totalRooms,
      occupancyRate
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return { days, totalRooms, startDate: start, endDate: end };
};

export const getPopularRoomTypesService = async () => {
  const { default: BookingModel } = await import("../models/Booking.js");

  const result = await BookingModel.aggregate([
    { $match: { status: { $in: ["Paid", "CheckedIn", "CheckedOut"] } } },
    { $group: { _id: "$roomType", count: { $sum: 1 }, revenue: { $sum: "$totalPrice" } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "roomtypes",
        localField: "_id",
        foreignField: "_id",
        as: "roomType"
      }
    },
    { $unwind: { path: "$roomType", preserveNullAndEmptyArrays: false } },
    {
      $project: {
        _id: 0,
        roomTypeName: "$roomType.name",
        bookingCount: "$count",
        totalRevenue: "$revenue"
      }
    }
  ]);

  return result;
};
