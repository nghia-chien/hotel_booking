import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Payment from "../models/Payment.js";
import { buildPaginationOptions } from "../utils/pagination.js";
import { calculateBookingPrice } from "../utils/pricing.js";

const CANCELLATION_HOURS = 24;
const DEFAULT_REFUND_PERCENTAGE = 100;

// ─── Room Search ─────────────────────────────────────────────────────────────

export const searchAvailableRoomsService = async (query) => {
  const { page, limit, skip, sort } = buildPaginationOptions({ query });

  const roomFilter = {
    isActive: true,
    capacity: { $gte: query.guests }
  };
  if (query.roomType) roomFilter.roomType = query.roomType;

  const allRooms = await Room.find(roomFilter).populate("roomType");
  const roomIds = allRooms.map((r) => r._id);

  if (!roomIds.length) {
    return { data: [], meta: { page, limit, total: 0, totalPages: 0 } };
  }

  const overlappingBookings = await Booking.find({
    room: { $in: roomIds },
    status: { $in: ["Pending", "Confirmed", "CheckedIn"] },
    checkIn: { $lt: query.checkOut },
    checkOut: { $gt: query.checkIn }
  }).select("room");

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

// ─── Booking CRUD ─────────────────────────────────────────────────────────────

export const createBookingService = async (data, userId) => {
  const room = await Room.findById(data.roomId).populate("roomType");

  if (!room || !room.isActive) {
    const err = new Error("Invalid or inactive room");
    err.statusCode = 400;
    throw err;
  }

  if (data.guests > room.capacity) {
    const err = new Error("Guests exceed room capacity");
    err.statusCode = 400;
    throw err;
  }

  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);
  
  const conflict = await Booking.exists({
    room: room._id,
    status: { $in: ["Pending", "Confirmed", "CheckedIn"] },
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  });

  if (conflict) {
    const err = new Error("Room is already booked for the selected dates");
    err.statusCode = 409;
    throw err;
  }

  const totalPrice = await calculateBookingPrice(room.roomType._id, checkIn, checkOut);
  const cancellationDeadline = new Date(checkIn.getTime() - CANCELLATION_HOURS * 60 * 60 * 1000);

  return Booking.create({
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
};

export const getMyBookingsService = async (req) => {
  const { page, limit, skip, sort } = buildPaginationOptions(req);
  const filter = { customer: req.user._id };

  const [items, total] = await Promise.all([
    Booking.find(filter).populate("room").populate("roomType").sort(sort).skip(skip).limit(limit),
    Booking.countDocuments(filter)
  ]);

  return { data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getAllBookingsService = async (req) => {
  const { page, limit, skip, sort } = buildPaginationOptions(req);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [items, total] = await Promise.all([
    Booking.find(filter)
      .populate("customer", "-password")
      .populate("room")
      .populate("roomType")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(filter)
  ]);

  return { data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

// ─── Payment ──────────────────────────────────────────────────────────────────

export const payBookingService = async (bookingId, userId, userRole, body) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    const err = new Error("Booking not found");
    err.statusCode = 404;
    throw err;
  }

  if (!booking.customer.equals(userId) && userRole === "user") {
    const err = new Error("You can only pay your own bookings");
    err.statusCode = 403;
    throw err;
  }

  if (booking.status !== "Pending") {
    const err = new Error("Only pending bookings can be paid");
    err.statusCode = 400;
    throw err;
  }

  const { method = "mock", cardLast4 } = body || {};
  const transactionId = `MOCK-${Date.now()}`;

  const payment = await Payment.create({
    booking: booking._id,
    customer: booking.customer,
    amount: booking.totalPrice,
    method,
    status: "SUCCESS",
    transactionId,
    metadata: { cardLast4 }
  });

  booking.status = "Confirmed";
  booking.paymentStatus = "Paid";
  await booking.save();

  return { booking, payment };
};

// ─── Cancellation ─────────────────────────────────────────────────────────────

export const cancelBookingService = async (bookingId, userId, userRole) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    const err = new Error("Booking not found");
    err.statusCode = 404;
    throw err;
  }

  if (!booking.customer.equals(userId) && userRole === "user") {
    const err = new Error("You can only cancel your own bookings");
    err.statusCode = 403;
    throw err;
  }

  if (!["Pending", "Confirmed"].includes(booking.status)) {
    const err = new Error("Only pending or confirmed bookings can be cancelled");
    err.statusCode = 400;
    throw err;
  }

  const now = new Date();
  if (booking.cancellationDeadline && now > booking.cancellationDeadline) {
    const err = new Error("Cancellation deadline has passed");
    err.statusCode = 400;
    throw err;
  }

  const refundPercentage = booking.refundPercentage || 0;
  const refundedAmount = (booking.totalPrice * refundPercentage) / 100;

  booking.status = "Cancelled";
  booking.paymentStatus =
    booking.paymentStatus === "Paid" && refundedAmount > 0 ? "Refunded" : booking.paymentStatus;
  booking.cancelledAt = now;
  booking.refundedAmount = refundedAmount;
  await booking.save();

  return booking;
};

// ─── Check-in / Check-out ─────────────────────────────────────────────────────

export const checkInService = async (bookingId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    const err = new Error("Booking not found");
    err.statusCode = 404;
    throw err;
  }

  if (booking.status !== "Confirmed") {
    const err = new Error("Only confirmed bookings can be checked in");
    err.statusCode = 400;
    throw err;
  }

  booking.status = "CheckedIn";
  await booking.save();
  return booking;
};

export const checkOutService = async (bookingId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    const err = new Error("Booking not found");
    err.statusCode = 404;
    throw err;
  }

  if (booking.status !== "CheckedIn") {
    const err = new Error("Only checked-in bookings can be checked out");
    err.statusCode = 400;
    throw err;
  }

  booking.status = "CheckedOut";
  await booking.save();
  return booking;
};

// ─── Reports ──────────────────────────────────────────────────────────────────

export const getOccupancyReportService = async (startDate, endDate) => {
  if (!startDate || !endDate) {
    const err = new Error("startDate and endDate are required");
    err.statusCode = 400;
    throw err;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  const totalRooms = await Room.countDocuments({ isActive: true });
  if (!totalRooms) return { occupancyRate: 0, totalRooms: 0 };

  const bookings = await Booking.find({
    status: { $in: ["Confirmed", "CheckedIn", "CheckedOut"] },
    checkIn: { $lt: end },
    checkOut: { $gt: start }
  });

  const occupiedRooms = new Set(bookings.map((b) => b.room.toString())).size;
  const occupancyRate = (occupiedRooms / totalRooms) * 100;

  return { occupancyRate, totalRooms, occupiedRooms };
};

export const getPopularRoomTypesService = async () => {
  return Booking.aggregate([
    { $match: { status: { $in: ["Confirmed", "CheckedIn", "CheckedOut"] } } },
    { $group: { _id: "$roomType", bookings: { $sum: 1 } } },
    { $sort: { bookings: -1 } },
    { $limit: 5 }
  ]);
};
