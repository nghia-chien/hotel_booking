import express from "express";
import { authenticate } from "../middlewares/auth.js";
import {
  createVNPayOrder,
  verifyVNPayReturn,
  refundVNPayPayment,
  getClientIp,
} from "../services/vnpayService.js";
import Payment from "../models/Payment.js";

const router = express.Router();

// ─── POST /api/payments/vnpay/create-order ────────────────────────────────────
// Tạo URL thanh toán VNPay, redirect về frontend
router.post("/vnpay/create-order", authenticate, async (req, res, next) => {
  try {
    const { bookingId, bookingIds } = req.body;
    const ids    = bookingIds ?? bookingId;
    const ipAddr = getClientIp(req);

    const data = await createVNPayOrder(ids, req.user._id, ipAddr);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/payments/vnpay/verify-return ───────────────────────────────────
// Frontend gọi sau khi VNPay redirect về /payment/success?vnp_*=...
// Frontend parse query params và gửi lên đây để verify + cập nhật DB
router.post("/vnpay/verify-return", authenticate, async (req, res, next) => {
  try {
    const vnpParams = req.body; // toàn bộ query params từ VNPay
    if (!vnpParams || !vnpParams.vnp_TxnRef) {
      return res.status(400).json({ success: false, message: "Missing VNPay params" });
    }

    const data = await verifyVNPayReturn(vnpParams, req.user._id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/payments/vnpay/refund ─────────────────────────────────────────
// Admin hoặc user (tuỳ rule) yêu cầu hoàn tiền
router.post("/vnpay/refund", authenticate, async (req, res, next) => {
  try {
    const { paymentId, refundAmount } = req.body;
    if (!paymentId) {
      return res.status(400).json({ success: false, message: "paymentId is required" });
    }

    const ipAddr = getClientIp(req);
    const data   = await refundVNPayPayment(
      paymentId,
      req.user._id,
      req.user.role,
      refundAmount,   // undefined → hoàn toàn bộ
      ipAddr
    );

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/payments/my ─────────────────────────────────────────────────────
// Lấy lịch sử payment của user hiện tại
router.get("/my", authenticate, async (req, res, next) => {
  try {
    const payments = await Payment.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .populate("bookings", "checkIn checkOut totalPrice status paymentStatus")
      .populate("booking",  "checkIn checkOut totalPrice status paymentStatus");

    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
});

export default router;
