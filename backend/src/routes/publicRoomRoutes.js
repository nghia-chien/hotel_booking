import express from "express";
import Room from "../models/Room.js";
import { calculateBookingPrice } from "../utils/pricing.js";

const router = express.Router();

// Public endpoint: lấy thông tin phòng + loại phòng cho trang khách
router.get("/:id", async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate("roomType");
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    next(error);
  }
});

// Public endpoint: tính giá theo khoảng ngày (pricing rules)
router.get("/:id/price", async (req, res, next) => {
  try {
    const { checkIn, checkOut, guests } = req.query;
    if (!checkIn || !checkOut || !guests) {
      return res.status(400).json({
        success: false,
        message: "checkIn, checkOut, guests are required"
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid checkIn/checkOut date"
      });
    }
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: "checkOut must be after checkIn"
      });
    }

    const guestsNumber = Number(guests);
    if (!Number.isFinite(guestsNumber) || guestsNumber < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid guests"
      });
    }

    const room = await Room.findById(req.params.id).populate("roomType");
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    if (!room.isActive) {
      return res.status(400).json({
        success: false,
        message: "Room is inactive"
      });
    }

    if (guestsNumber > room.capacity) {
      return res.status(400).json({
        success: false,
        message: "Guests exceed room capacity"
      });
    }

    const totalPrice = await calculateBookingPrice(
      room.roomType._id,
      checkInDate,
      checkOutDate
    );

    const nights = Math.max(
      1,
      Math.round(
        (checkOutDate.getTime() - checkInDate.getTime()) / (24 * 60 * 60 * 1000)
      )
    );

    res.json({
      success: true,
      data: {
        totalPrice,
        nights,
        pricePerNight: totalPrice / nights
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;

