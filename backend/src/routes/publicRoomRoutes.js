import express from "express";
import Room from "../models/Room.js";

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

export default router;

