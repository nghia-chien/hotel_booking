import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Payment from "../models/Payment.js";
import { buildPaginationOptions } from "../utils/pagination.js";
import PDFDocument from "pdfkit";
import { format } from "date-fns";
import {
  createBookingSchema,
  searchRoomsSchema
} from "../validators/bookingValidators.js";
import { calculateBookingPrice } from "../utils/pricing.js";
import { createNotification } from "../utils/notificationHelper.js";

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

const CANCELLATION_HOURS = 24;
const DEFAULT_REFUND_PERCENTAGE = 100;

export const searchAvailableRooms = async (req, res, next) => {
  try {
    const query = validate(searchRoomsSchema, req.query);

    const { page, limit, skip, sort } = buildPaginationOptions({
      query
    });

    const roomFilter = {
      isActive: true,
      capacity: { $gte: query.guests }
    };
    if (query.roomType) {
      roomFilter.roomType = query.roomType;
    }

    const allRooms = await Room.find(roomFilter).populate("roomType");
    const roomIds = allRooms.map((r) => r._id);

    if (!roomIds.length) {
      return res.json({
        success: true,
        data: [],
        meta: { page, limit, total: 0, totalPages: 0 }
      });
    }

    const overlappingBookings = await Booking.find({
      room: { $in: roomIds },
      status: { $in: ["Pending", "Confirmed", "CheckedIn"] },
      checkIn: { $lt: query.checkOut },
      checkOut: { $gt: query.checkIn }
    }).select("room");

    const bookedRoomIds = new Set(
      overlappingBookings.map((b) => b.room.toString())
    );

    let availableRooms = allRooms.filter(
      (room) => !bookedRoomIds.has(room._id.toString())
    );

    const checkIn = new Date(query.checkIn);
    const checkOut = new Date(query.checkOut);

    const roomsWithPrice = await Promise.all(
      availableRooms.map(async (room) => {
        const totalPrice = await calculateBookingPrice(
          room.roomType._id,
          checkIn,
          checkOut
        );
        return { room, totalPrice };
      })
    );

    let filtered = roomsWithPrice;
    if (query.minPrice != null) {
      filtered = filtered.filter((r) => r.totalPrice >= query.minPrice);
    }
    if (query.maxPrice != null) {
      filtered = filtered.filter((r) => r.totalPrice <= query.maxPrice);
    }

    const sortFields = sort;
    const sortKeys = Object.keys(sortFields);
    if (sortKeys.length) {
      filtered.sort((a, b) => {
        for (const key of sortKeys) {
          const dir = sortFields[key];
          const aValue = key === "totalPrice" ? a.totalPrice : a.room[key];
          const bValue = key === "totalPrice" ? b.totalPrice : b.room[key];
          if (aValue < bValue) return -1 * dir;
          if (aValue > bValue) return 1 * dir;
        }
        return 0;
      });
    }

    const total = filtered.length;
    const paged = filtered.slice(skip, skip + limit);

    res.json({
      success: true,
      data: paged.map((item) => ({
        room: item.room,
        totalPrice: item.totalPrice
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (req, res, next) => {
  try {
    const data = validate(createBookingSchema, req.body);
    const room = await Room.findById(data.roomId).populate("roomType");

    if (!room || !room.isActive) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive room"
      });
    }

    if (data.guests > room.capacity) {
      return res.status(400).json({
        success: false,
        message: "Guests exceed room capacity"
      });
    }

    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);

    const conflict = await Booking.exists({
      room: room._id,
      status: { $in: ["Pending", "Confirmed", "CheckedIn"] },
      checkIn: { $lt: checkOut },
      checkOut: { $gt: checkIn }
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "Room is already booked for the selected dates"
      });
    }

    const totalPrice = await calculateBookingPrice(
      room.roomType._id,
      checkIn,
      checkOut
    );

    const cancellationDeadline = new Date(
      checkIn.getTime() - CANCELLATION_HOURS * 60 * 60 * 1000
    );

    const booking = await Booking.create({
      customer: req.user._id,
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

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

export const payBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    if (!booking.customer.equals(req.user._id) && req.user.role === "user") {
      return res.status(403).json({
        success: false,
        message: "You can only pay your own bookings"
      });
    }

    if (booking.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be paid"
      });
    }

    const { method = "mock", cardLast4 } = req.body || {};

    const transactionId = `MOCK-${Date.now()}`;

    const payment = await Payment.create({
      booking: booking._id,
      customer: booking.customer,
      amount: booking.totalPrice,
      method,
      status: "SUCCESS",
      transactionId,
      metadata: {
        cardLast4
      }
    });

    booking.status = "Confirmed";
    booking.paymentStatus = "Paid";
    await booking.save();

    // Notify User
    const roomNotify = await Room.findById(booking.room).populate("roomType");
    void createNotification(booking.customer, "payment_success", {
      transactionId,
      amount: booking.totalPrice,
      bookingId: booking._id
    });
    void createNotification(booking.customer, "booking_confirmed", {
      roomName: roomNotify?.roomNumber || "Phòng",
      checkIn: format(booking.checkIn, "dd/MM/yyyy"),
      totalPrice: booking.totalPrice,
      bookingId: booking._id
    });

    res.json({
      success: true,
      data: {
        booking,
        payment
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const { page, limit, skip, sort } = buildPaginationOptions(req);

    const filter = { customer: req.user._id };

    const [items, total] = await Promise.all([
      Booking.find(filter)
        .populate("room")
        .populate("roomType")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    if (!booking.customer.equals(req.user._id) && req.user.role === "user") {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own bookings"
      });
    }

    if (booking.status !== "Pending" && booking.status !== "Confirmed") {
      return res.status(400).json({
        success: false,
        message: "Only pending or confirmed bookings can be cancelled"
      });
    }

    const now = new Date();
    if (booking.cancellationDeadline && now > booking.cancellationDeadline) {
      return res.status(400).json({
        success: false,
        message: "Cancellation deadline has passed"
      });
    }

    const refundPercentage = booking.refundPercentage || 0;
    const refundedAmount = (booking.totalPrice * refundPercentage) / 100;

    booking.status = "Cancelled";
    booking.paymentStatus =
      booking.paymentStatus === "Paid" && refundedAmount > 0
        ? "Refunded"
        : booking.paymentStatus;
    booking.cancelledAt = now;
    booking.refundedAmount = refundedAmount;
    await booking.save();

    // Notify User
    const roomNotify = await Room.findById(booking.room).populate("roomType");
    void createNotification(booking.customer, "booking_cancelled", {
      roomName: roomNotify?.roomNumber || "Phòng",
      bookingId: booking._id,
      reason: req.body.reason || "Huỷ theo yêu cầu"
    });

    if (booking.paymentStatus === "Refunded") {
      await Payment.create({
        booking: booking._id,
        customer: booking.customer,
        amount: refundedAmount,
        method: "refund",
        status: "SUCCESS",
        transactionId: `REFUND-${Date.now()}`,
        metadata: {
          refundPercentage,
          cancelledAt: now.toISOString()
        }
      });

      void createNotification(booking.customer, "refund_processed", {
        amount: refundedAmount,
        bookingId: booking._id
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const { page, limit, skip, sort } = buildPaginationOptions(req);
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

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

    res.json({
      success: true,
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const checkIn = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    if (booking.status !== "Confirmed") {
      return res.status(400).json({
        success: false,
        message: "Only confirmed bookings can be checked in"
      });
    }

    booking.status = "CheckedIn";
    await booking.save();

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

export const checkOut = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    if (booking.status !== "CheckedIn") {
      return res.status(400).json({
        success: false,
        message: "Only checked-in bookings can be checked out"
      });
    }

    booking.status = "CheckedOut";
    await booking.save();

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

export const getOccupancyReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required"
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const totalRooms = await Room.countDocuments({ isActive: true });
    if (!totalRooms) {
      return res.json({
        success: true,
        data: { occupancyRate: 0, totalRooms: 0 }
      });
    }

    const bookings = await Booking.find({
      status: { $in: ["Confirmed", "CheckedIn", "CheckedOut"] },
      checkIn: { $lt: end },
      checkOut: { $gt: start }
    });

    const occupiedRoomIds = new Set(
      bookings.map((b) => b.room.toString())
    );

    const occupancyRate =
      (occupiedRoomIds.size / totalRooms) * 100;

    res.json({
      success: true,
      data: {
        occupancyRate,
        totalRooms,
        occupiedRooms: occupiedRoomIds.size
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getPopularRoomTypes = async (req, res, next) => {
  try {
    const result = await Booking.aggregate([
      {
        $match: {
          status: { $in: ["Confirmed", "CheckedIn", "CheckedOut"] }
        }
      },
      {
        $group: {
          _id: "$roomType",
          bookings: { $sum: 1 }
        }
      },
      {
        $sort: { bookings: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("room")
      .populate("roomType")
      .populate("customer", "fullName email phone");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    if (!booking.customer._id.equals(req.user._id) && req.user.role === "user") {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

export const generateInvoice = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("room")
      .populate("roomType")
      .populate("customer", "fullName email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    if (!booking.customer._id.equals(req.user._id) && req.user.role === "user") {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    if (booking.status === "Pending" || booking.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Invoice not available for this status"
      });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoice-${booking._id}.pdf"`
    );

    doc.pipe(res);

    // Header
    doc
      .fillColor("#444444")
      .fontSize(20)
      .text("Hotel Booking", 50, 50)
      .fontSize(10)
      .text("123 Hotel Street, Hanoi, Vietnam", 200, 50, { align: "right" })
      .text("Phone: +84 123 456 789", 200, 65, { align: "right" })
      .moveDown();

    doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, 90).lineTo(550, 90).stroke();

    // Invoice Info
    doc
      .fontSize(12)
      .text(`Invoice Number: INV-${booking._id.toString().substring(0, 8).toUpperCase()}`, 50, 110)
      .text(`Date: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 50, 125)
      .text(`Booking ID: ${booking._id}`, 50, 140)
      .moveDown();

    // Customer Info
    doc
      .fontSize(14)
      .text("Billed To:", 50, 170)
      .fontSize(12)
      .text(booking.customer.fullName, 50, 190)
      .text(booking.customer.email, 50, 205)
      .moveDown();

    // Table Header
    const tableTop = 250;
    doc
      .fontSize(12)
      .text("Room", 50, tableTop, { bold: true })
      .text("Check-in", 200, tableTop, { bold: true })
      .text("Check-out", 320, tableTop, { bold: true })
      .text("Total", 450, tableTop, { align: "right", bold: true });

    doc.strokeColor("#eeeeee").lineWidth(1).moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Table Row
    const rowY = tableTop + 30;
    doc
      .text(booking.room.name, 50, rowY)
      .text(format(booking.checkIn, "dd/MM/yyyy"), 200, rowY)
      .text(format(booking.checkOut, "dd/MM/yyyy"), 320, rowY)
      .text(`${booking.totalPrice.toLocaleString()} VND`, 450, rowY, { align: "right" });

    doc.strokeColor("#eeeeee").lineWidth(1).moveTo(50, rowY + 15).lineTo(550, rowY + 15).stroke();

    // Summary
    const summaryY = rowY + 50;
    doc
      .fontSize(14)
      .text("Total Amount:", 350, summaryY, { bold: true })
      .text(`${booking.totalPrice.toLocaleString()} VND`, 450, summaryY, { align: "right", bold: true });

    // Footer
    doc
      .fontSize(10)
      .text("Thank you for choosing our service!", 50, 700, { align: "center", width: 500 });

    doc.end();
  } catch (error) {
    next(error);
  }
};

