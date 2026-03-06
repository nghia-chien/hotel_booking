import {
  searchAvailableRoomsService,
  createBookingService,
  payBookingService,
  getMyBookingsService,
  cancelBookingService,
  getAllBookingsService,
  checkInService,
  checkOutService,
  getOccupancyReportService,
  getPopularRoomTypesService
} from "../services/bookingService.js";
import {
  createBookingSchema,
  searchRoomsSchema
} from "../validators/bookingValidators.js";

const validate = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    const err = new Error("Validation error");
    err.statusCode = 400;
    err.details = error.details;
    throw err;
  }
  return value;
};

export const searchAvailableRooms = async (req, res, next) => {
  try {
    const query = validate(searchRoomsSchema, req.query);
    const result = await searchAvailableRoomsService(query);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (req, res, next) => {
  try {
    const data = validate(createBookingSchema, req.body);
    const booking = await createBookingService(data, req.user._id);
    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

export const payBooking = async (req, res, next) => {
  try {
    const result = await payBookingService(req.params.id, req.user._id, req.user.role, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const result = await getMyBookingsService(req);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await cancelBookingService(req.params.id, req.user._id, req.user.role);
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const result = await getAllBookingsService(req);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const checkIn = async (req, res, next) => {
  try {
    const booking = await checkInService(req.params.id);
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

export const checkOut = async (req, res, next) => {
  try {
    const booking = await checkOutService(req.params.id);
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

export const getOccupancyReport = async (req, res, next) => {
  try {
    const data = await getOccupancyReportService(req.query.startDate, req.query.endDate);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getPopularRoomTypes = async (req, res, next) => {
  try {
    const data = await getPopularRoomTypesService();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
