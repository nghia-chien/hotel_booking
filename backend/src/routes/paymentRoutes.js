import express from "express";
import { authenticate, authorizeRoles } from "../middlewares/auth.js";
import Payment from "../models/Payment.js";
import {
  createPayPalOrderController,
  capturePayPalPaymentController,
  getPayPalOrderController,
  processPaymentController,
  refundPaymentController,
  getPaymentHistoryController,
  getPaymentDetailsController,
  paypalWebhookController,
  validateCreatePayPalOrder,
  validateCapturePayPalPayment,
  validateProcessPayment,
  validateRefundPayment
} from "../controllers/paymentController.js";

const router = express.Router();

// PayPal specific routes
router.post(
  "/paypal/orders/:bookingId",
  authenticate,
  validateCreatePayPalOrder,
  createPayPalOrderController
);

router.post(
  "/paypal/capture/:orderId",
  authenticateToken,
  validateCapturePayPalPayment,
  capturePayPalPaymentController
);

router.get(
  "/paypal/orders/:orderId",
  authenticateToken,
  getPayPalOrderController
);

// General payment processing route (supports multiple payment methods)
router.post(
  "/bookings/:bookingId/pay",
  authenticateToken,
  validateProcessPayment,
  processPaymentController
);

// Refund payment
router.post(
  "/:paymentId/refund",
  authenticateToken,
  validateRefundPayment,
  refundPaymentController
);

// Get payment history for authenticated user
router.get(
  "/history",
  authenticateToken,
  getPaymentHistoryController
);

// Get specific payment details
router.get(
  "/:paymentId",
  authenticateToken,
  getPaymentDetailsController
);

// PayPal webhook (no authentication required)
router.post(
  "/webhook/paypal",
  express.raw({ type: 'application/json' }),
  paypalWebhookController
);

// Admin routes for payment management
router.get(
  "/admin/all",
  authenticateToken,
  requireRole('admin'),
  async (req, res) => {
    try {
      const { page = 1, limit = 10, status, method } = req.query;
      const skip = (page - 1) * limit;

      const filter = {};
      if (status) filter.status = status;
      if (method) filter.method = method;

      const [payments, total] = await Promise.all([
        Payment.find(filter)
          .populate('booking', 'checkIn checkOut totalPrice')
          .populate('customer', 'email firstName lastName')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Payment.countDocuments(filter)
      ]);

      res.status(200).json({
        success: true,
        data: payments,
        meta: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        },
        message: "All payments retrieved successfully"
      });

    } catch (error) {
      console.error("Get all payments error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve payments"
      });
    }
  }
);

// Get payment statistics (admin only)
router.get(
  "/admin/stats",
  authenticateToken,
  requireRole('admin'),
  async (req, res) => {
    try {
      const [
        totalRevenue,
        totalPayments,
        paymentsByMethod,
        paymentsByStatus,
        recentPayments
      ] = await Promise.all([
        Payment.aggregate([
          { $match: { status: 'SUCCESS' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Payment.countDocuments(),
        Payment.aggregate([
          { $group: { _id: '$method', count: { $sum: 1 }, total: { $sum: '$amount' } } }
        ]),
        Payment.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        Payment.find()
          .populate('booking', 'checkIn checkOut')
          .populate('customer', 'email firstName lastName')
          .sort({ createdAt: -1 })
          .limit(5)
      ]);

      res.status(200).json({
        success: true,
        data: {
          totalRevenue: totalRevenue[0]?.total || 0,
          totalPayments,
          paymentsByMethod,
          paymentsByStatus,
          recentPayments
        },
        message: "Payment statistics retrieved successfully"
      });

    } catch (error) {
      console.error("Get payment stats error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve payment statistics"
      });
    }
  }
);

export default router;
