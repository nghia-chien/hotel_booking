import { body, validationResult } from "express-validator";
import { 
  createPayPalOrder, 
  capturePayPalPayment, 
  getPayPalOrderDetails,
  refundPayPalPayment,
  handlePayPalWebhook 
} from "../services/paypalService.js";
import { payBookingService } from "../services/bookingService.js";
import Payment from "../models/Payment.js";

// Create PayPal order for booking payment
export const createPayPalOrderController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookingId } = req.params;
    const result = await createPayPalOrder(bookingId, req.user._id);

    res.status(201).json({
      success: true,
      data: result,
      message: "PayPal order created successfully"
    });

  } catch (error) {
    console.error("Create PayPal order error:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create PayPal order"
    });
  }
};

// Capture PayPal payment after user approval
export const capturePayPalPaymentController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId } = req.params;
    const { payerId } = req.body;

    const result = await capturePayPalPayment(orderId, payerId, req.user._id);

    res.status(200).json({
      success: true,
      data: result,
      message: "Payment captured successfully"
    });

  } catch (error) {
    console.error("Capture PayPal payment error:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to capture PayPal payment"
    });
  }
};

// Get PayPal order details
export const getPayPalOrderController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const orderDetails = await getPayPalOrderDetails(orderId);

    res.status(200).json({
      success: true,
      data: orderDetails,
      message: "Order details retrieved successfully"
    });

  } catch (error) {
    console.error("Get PayPal order error:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to get PayPal order details"
    });
  }
};

// Process payment (supports both existing mock payment and PayPal)
export const processPaymentController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookingId } = req.params;
    const { method, cardLast4, paypalOrderId, payerId } = req.body;

    let result;

    if (method === 'paypal') {
      if (!paypalOrderId || !payerId) {
        return res.status(400).json({
          success: false,
          message: "PayPal order ID and payer ID are required for PayPal payments"
        });
      }
      result = await capturePayPalPayment(paypalOrderId, payerId, req.user._id);
    } else {
      // Use existing payment service for other methods
      result = await payBookingService(bookingId, req.user._id, req.user.role, {
        method,
        cardLast4
      });
    }

    res.status(200).json({
      success: true,
      data: result,
      message: "Payment processed successfully"
    });

  } catch (error) {
    console.error("Process payment error:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to process payment"
    });
  }
};

// Refund payment
export const refundPaymentController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    let result;

    if (payment.method === 'paypal') {
      result = await refundPayPalPayment(paymentId, req.user._id, req.user.role);
    } else {
      // For non-PayPal payments, you would implement other refund methods here
      return res.status(400).json({
        success: false,
        message: "Refund not supported for this payment method"
      });
    }

    res.status(200).json({
      success: true,
      data: result,
      message: "Refund processed successfully"
    });

  } catch (error) {
    console.error("Refund payment error:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to process refund"
    });
  }
};

// Get payment history for user
export const getPaymentHistoryController = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, method } = req.query;
    const skip = (page - 1) * limit;

    const filter = { customer: req.user._id };
    if (status) filter.status = status;
    if (method) filter.method = method;

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('booking', 'checkIn checkOut totalPrice')
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
      message: "Payment history retrieved successfully"
    });

  } catch (error) {
    console.error("Get payment history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve payment history"
    });
  }
};

// Get payment details by ID
export const getPaymentDetailsController = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
      .populate('booking')
      .populate('customer', 'email firstName lastName');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    // Check authorization
    if (!payment.customer._id.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "You can only view your own payments"
      });
    }

    res.status(200).json({
      success: true,
      data: payment,
      message: "Payment details retrieved successfully"
    });

  } catch (error) {
    console.error("Get payment details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve payment details"
    });
  }
};

// PayPal webhook handler
export const paypalWebhookController = async (req, res) => {
  try {
    // Verify webhook signature (you should implement this in production)
    // const webhookVerified = await verifyPayPalWebhook(req);
    // if (!webhookVerified) {
    //   return res.status(401).json({ message: "Webhook verification failed" });
    // }

    const result = await handlePayPalWebhook(req.body);

    res.status(200).json({
      success: true,
      data: result,
      message: "Webhook processed successfully"
    });

  } catch (error) {
    console.error("PayPal webhook error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process webhook"
    });
  }
};

// Validation middleware
export const validateCreatePayPalOrder = [
  body('bookingId')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isMongoId()
    .withMessage('Invalid booking ID format')
];

export const validateCapturePayPalPayment = [
  body('payerId')
    .notEmpty()
    .withMessage('Payer ID is required')
];

export const validateProcessPayment = [
  body('method')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['card', 'bank_transfer', 'cash', 'mock', 'paypal'])
    .withMessage('Invalid payment method'),
  body('cardLast4')
    .optional()
    .isLength({ min: 4, max: 4 })
    .withMessage('Card last 4 digits must be exactly 4 characters'),
  body('paypalOrderId')
    .if(body('method').equals('paypal'))
    .notEmpty()
    .withMessage('PayPal order ID is required for PayPal payments'),
  body('payerId')
    .if(body('method').equals('paypal'))
    .notEmpty()
    .withMessage('Payer ID is required for PayPal payments')
];

export const validateRefundPayment = [
  body('paymentId')
    .notEmpty()
    .withMessage('Payment ID is required')
    .isMongoId()
    .withMessage('Invalid payment ID format')
];
