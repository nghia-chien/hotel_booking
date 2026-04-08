import * as BookingService from "../services/bookingService.js";
import PDFDocument from "pdfkit";
import { format } from "date-fns";
import Booking from "../models/Booking.js"; // For direct model tasks in invoice or complex report

export const searchAvailableRooms = async (req, res, next) => {
  try {
    const result = await BookingService.searchAvailableRoomsService(req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (req, res, next) => {
  try {
    const booking = await BookingService.createBookingService(req.body, req.user._id);
    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const result = await BookingService.getMyBookingsService(req);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const result = await BookingService.getAllBookingsService(req);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const payBooking = async (req, res, next) => {
  try {
    // This is for mock payments. Real payments go melalui vnpayService.
    const { method = "mock" } = req.body || {};
    const transactionId = `MOCK-${Date.now()}`;
    const booking = await BookingService.processPaymentSuccess(req.params.id, transactionId);
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body || {};
    const { booking } = await BookingService.cancelBookingService(
      req.params.id, 
      req.user._id, 
      req.user.role, 
      reason
    );
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

export const checkIn = async (req, res, next) => {
  try {
    const booking = await BookingService.checkInService(req.params.id);
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

export const checkOut = async (req, res, next) => {
  try {
    const booking = await BookingService.checkOutService(req.params.id);
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

export const getOccupancyReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await BookingService.getOccupancyReportService(startDate, endDate);
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

export const getPopularRoomTypes = async (req, res, next) => {
  try {
    const data = await BookingService.getPopularRoomTypesService();
    res.json({ success: true, data });
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
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (!booking.customer._id.equals(req.user._id) && req.user.role === "user") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.json({ success: true, data: booking });
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

    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (!booking.customer._id.equals(req.user._id) && req.user.role === "user") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (["Pending", "Expired", "Cancelled"].includes(booking.status)) {
      return res.status(400).json({ success: false, message: "Invoice not available for this status" });
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="invoice-${booking._id}.pdf"`);
    doc.pipe(res);

    doc.fillColor("#444444").fontSize(20).text("Hotel Booking", 50, 50);
    doc.fontSize(10).text("Ho Chi Minh, Vietnam", 200, 50, { align: "right" });
    doc.text("Phone: +84 37569652", 200, 65, { align: "right" }).moveDown();
    doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, 90).lineTo(550, 90).stroke();

    doc.fontSize(12).text(`Invoice Number: INV-${booking._id.toString().substring(0, 8).toUpperCase()}`, 50, 110);
    doc.text(`Date: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 50, 125);
    doc.text(`Booking ID: ${booking._id}`, 50, 140).moveDown();

    doc.fontSize(14).text("Billed To:", 50, 170);
    doc.fontSize(12).text(booking.customer.fullName, 50, 190);
    doc.text(booking.customer.email, 50, 205).moveDown();

    const tableTop = 250;
    doc.fontSize(12).text("Room", 50, tableTop, { bold: true });
    doc.text("Check-in", 200, tableTop, { bold: true });
    doc.text("Check-out", 320, tableTop, { bold: true });
    doc.text("Total", 450, tableTop, { align: "right", bold: true });

    doc.strokeColor("#eeeeee").lineWidth(1).moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    const rowY = tableTop + 30;
    doc.text(booking.room?.roomNumber || "Phòng", 50, rowY);
    doc.text(format(booking.checkIn, "dd/MM/yyyy"), 200, rowY);
    doc.text(format(booking.checkOut, "dd/MM/yyyy"), 320, rowY);
    doc.text(`${booking.totalPrice.toLocaleString()} USD`, 450, rowY, { align: "right" });

    doc.strokeColor("#eeeeee").lineWidth(1).moveTo(50, rowY + 15).lineTo(550, rowY + 15).stroke();

    const summaryY = rowY + 50;
    doc.fontSize(14).text("Total Amount:", 350, summaryY, { bold: true });
    doc.text(`${booking.totalPrice.toLocaleString()} USD`, 450, summaryY, { align: "right", bold: true });

    doc.fontSize(10).text("Thank you for choosing our service!", 50, 700, { align: "center", width: 500 });
    doc.end();
  } catch (error) {
    next(error);
  }
};
