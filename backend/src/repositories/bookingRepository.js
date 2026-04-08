import Booking from "../models/Booking.js";

export const createBooking = async (bookingData) => {
  return await Booking.create(bookingData);
};

export const findBookingById = async (id) => {
  return await Booking.findById(id).populate("room").populate("roomType").populate("customer", "fullName email phone");
};

export const findBookingsByFilter = async (filter, sort, skip, limit) => {
  return await Booking.find(filter)
    .populate("room")
    .populate("roomType")
    .populate("customer", "-password")
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

export const countBookings = async (filter) => {
  return await Booking.countDocuments(filter);
};

export const updateBookingStatus = async (id, status, paymentStatus = null) => {
  const update = { status };
  if (paymentStatus) {
    update.paymentStatus = paymentStatus;
  }
  return await Booking.findByIdAndUpdate(id, { $set: update }, { new: true });
};

export const findExpiredPendingBookings = async (minutes) => {
  const expiryDate = new Date(Date.now() - minutes * 60 * 1000);
  return await Booking.find({
    status: "Pending",
    createdAt: { $lt: expiryDate }
  });
};

export const existsOverlappingBooking = async (roomId, checkIn, checkOut) => {
  return await Booking.exists({
    room: roomId,
    status: { $in: ["Pending", "Paid", "CheckedIn"] },
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn }
  });
};

export default {
  createBooking,
  findBookingById,
  findBookingsByFilter,
  countBookings,
  updateBookingStatus,
  findExpiredPendingBookings,
  existsOverlappingBooking
};
