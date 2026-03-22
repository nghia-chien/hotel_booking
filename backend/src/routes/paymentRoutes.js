import express from "express";
import { authenticate } from "../middlewares/auth.js";
import {
  createVNPayOrder,
  handleVNPayReturn,
  handleVNPayIpn,
  refundVNPayPayment,
  getClientIp,
} from "../services/vnpayService.js";
import Payment from "../models/Payment.js";

const router = express.Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getBaseUrl = (req) => `${req.protocol}://${req.get("host")}`;
const getFrontendUrl = () => process.env.FRONTEND_URL || "http://localhost:5173";

// ─── POST /api/payments/vnpay/create-order ────────────────────────────────────

router.post("/vnpay/create-order", authenticate, async (req, res, next) => {
  console.log("\n========== [VNPay] CREATE ORDER ==========");
  console.log("[1] Request body:", JSON.stringify(req.body));
  console.log("[1] User:", req.user?._id, req.user?.email);

  try {
    const { bookingId, bookingIds } = req.body;
    const ids    = bookingIds ?? bookingId;
    const ipAddr = getClientIp(req);

    console.log("[2] bookingIds:", ids, "| IP:", ipAddr);

    if (!ids) {
      return res.status(400).json({ success: false, message: "bookingId or bookingIds is required" });
    }

    const data = await createVNPayOrder(ids, req.user._id, ipAddr, getBaseUrl(req));

    console.log("[3] Payment URL created:", data.paymentUrl);
    console.log("[3] txnRef:", data.txnRef);
    console.log("==========================================\n");

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("[ERROR] createVNPayOrder:", error.message);
    next(error);
  }
});

// ─── GET /api/payments/vnpay/return ──────────────────────────────────────────
// VNPay gọi endpoint này sau khi user thanh toán.
// Backend verify → redirect về frontend (không cần frontend gọi thêm API).

router.get("/vnpay/return", async (req, res) => {
  console.log("\n========== [VNPay] RETURN ==========");
  console.log("[1] Query:", JSON.stringify(req.query));

  const frontendUrl = getFrontendUrl();

  try {
    const result = await handleVNPayReturn(req.query);

    if (!result.isSuccess) {
      console.log("[2] Return FAILED, responseCode:", result.responseCode);
      return res.redirect(
        `${frontendUrl}/payment/result?status=failed&code=${result.responseCode ?? ""}`
      );
    }

    console.log("[2] Return SUCCESS");
    return res.redirect(`${frontendUrl}/payment/result?status=success`);
  } catch (error) {
    console.error("[ERROR] handleVNPayReturn:", error.message);
    return res.redirect(`${frontendUrl}/payment/result?status=failed&code=99`);
  }
});

// ─── POST /api/payments/vnpay/ipn ─────────────────────────────────────────────
// Server-to-server notification từ VNPay — backup khi user đóng browser sớm.
// Phải trả về { RspCode, Message } đúng format, không redirect.

router.post("/vnpay/ipn", async (req, res) => {
  console.log("\n========== [VNPay] IPN ==========");
  console.log("[1] Query:", JSON.stringify(req.query));

  try {
    const result = await handleVNPayIpn(req.query);
    console.log("[2] IPN result:", result);
    return res.status(200).json(result);
  } catch (error) {
    console.error("[ERROR] handleVNPayIpn:", error.message);
    return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
});

// ─── POST /api/payments/vnpay/refund ─────────────────────────────────────────

router.post("/vnpay/refund", authenticate, async (req, res, next) => {
  console.log("\n========== [VNPay] REFUND ==========");
  console.log("[1] Request body:", JSON.stringify(req.body));

  try {
    const { paymentId, refundAmount } = req.body;
    if (!paymentId) {
      return res.status(400).json({ success: false, message: "paymentId is required" });
    }

    const ipAddr = getClientIp(req);
    console.log("[2] paymentId:", paymentId, "| refundAmount:", refundAmount, "| IP:", ipAddr);

    const data = await refundVNPayPayment(
      paymentId,
      req.user._id,
      req.user.role,
      refundAmount,
      ipAddr
    );

    console.log("[3] Refund result:", data.success, "| responseCode:", data.responseCode);
    console.log("=====================================\n");

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("[ERROR] refundVNPayPayment:", error.message);
    next(error);
  }
});

// ─── GET /api/payments/my ─────────────────────────────────────────────────────

router.get("/my", authenticate, async (req, res, next) => {
  try {
    const payments = await Payment.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "booking",
        select: "checkIn checkOut totalPrice status room roomType",
        populate: [
          { path: "room", select: "roomNumber" },
          { path: "roomType", select: "name" }
        ]
      })
      .populate({
        path: "bookings",
        select: "checkIn checkOut totalPrice status room roomType",
        populate: [
          { path: "room", select: "roomNumber" },
          { path: "roomType", select: "name" }
        ]
      });

    return res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
});

export default router;