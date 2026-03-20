import express from "express";
import { authenticate } from "../middlewares/auth.js";
import { createStripeCheckoutSession } from "../controllers/paymentController.js";
import {
  createPayPalOrder,
  capturePayPalPayment
} from "../services/paypalService.js";

const router = express.Router();

router.post(
  "/stripe/checkout-session",
  authenticate,
  createStripeCheckoutSession
);

// PayPal (gateway thật)
router.post("/paypal/create-order", authenticate, async (req, res, next) => {
  try {
    const { bookingId, bookingIds } = req.body;
    const ids = bookingIds ?? bookingId;
    const data = await createPayPalOrder(ids, req.user._id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.post("/paypal/capture", authenticate, async (req, res, next) => {
  try {
    const { orderId, payerId } = req.body;
    if (!orderId || !payerId) {
      return res.status(400).json({
        success: false,
        message: "orderId and payerId are required"
      });
    }
    const data = await capturePayPalPayment(orderId, payerId, req.user._id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

export default router;

