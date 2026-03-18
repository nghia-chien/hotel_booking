import axios from "axios";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";

// PayPal API configuration
const PAYPAL_API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

// Get PayPal access token
const getPayPalAccessToken = async () => {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    
    const response = await axios.post(`${PAYPAL_API_BASE}/v1/oauth2/token`, 
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    return response.data.access_token;
  } catch (error) {
    console.error('PayPal auth error:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with PayPal');
  }
};

// Create PayPal order
export const createPayPalOrder = async (bookingId, userId) => {
  try {
    // Validate booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    if (!booking.customer.equals(userId)) {
      const error = new Error('You can only pay for your own bookings');
      error.statusCode = 403;
      throw error;
    }

    if (booking.status !== 'Pending') {
      const error = new Error('Only pending bookings can be paid');
      error.statusCode = 400;
      throw error;
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Create order payload
    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: booking._id.toString(),
        description: `Hotel booking for ${booking.roomType}`,
        amount: {
          currency_code: 'USD',
          value: booking.totalPrice.toFixed(2)
        },
        custom_data: {
          booking_id: booking._id.toString(),
          customer_id: userId
        }
      }],
      application_context: {
        brand_name: 'Hotel Booking System',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.FRONTEND_URL}/payment/success`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`
      }
    };

    // Create order
    const response = await axios.post(`${PAYPAL_API_BASE}/v2/checkout/orders`,
      orderPayload,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Create pending payment record
    await Payment.create({
      booking: booking._id,
      customer: booking.customer,
      amount: booking.totalPrice,
      method: 'paypal',
      status: 'PENDING',
      transactionId: `PAYPAL-${Date.now()}`,
      paypalOrderId: response.data.id,
      metadata: {
        orderStatus: response.data.status,
        createTime: response.data.create_time
      }
    });

    return {
      orderId: response.data.id,
      approvalUrl: response.data.links.find(link => link.rel === 'approve').href
    };

  } catch (error) {
    console.error('PayPal order creation error:', error.response?.data || error.message);
    throw new Error('Failed to create PayPal order');
  }
};

// Capture PayPal payment
export const capturePayPalPayment = async (orderId, payerId, userId) => {
  try {
    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Capture the payment
    const response = await axios.post(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const captureData = response.data;
    
    if (captureData.status !== 'COMPLETED') {
      const error = new Error('Payment not completed');
      error.statusCode = 400;
      throw error;
    }

    // Find the pending payment record
    const payment = await Payment.findOne({ paypalOrderId: orderId });
    if (!payment) {
      const error = new Error('Payment record not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify user ownership
    if (!payment.customer.equals(userId)) {
      const error = new Error('Unauthorized payment capture');
      error.statusCode = 403;
      throw error;
    }

    // Update payment record
    const capture = captureData.purchase_units[0].payments.captures[0];
    payment.status = 'SUCCESS';
    payment.transactionId = capture.id;
    payment.paypalCaptureId = capture.id;
    payment.paypalPayerId = payerId;
    payment.metadata = {
      ...payment.metadata,
      captureStatus: capture.status,
      captureAmount: capture.amount,
      captureTime: capture.create_time,
      paypalFee: capture.seller_receivable_breakdown?.paypal_fee?.value || 0,
      netAmount: capture.seller_receivable_breakdown?.net_amount?.value || capture.amount.value
    };
    await payment.save();

    // Update booking status
    const booking = await Booking.findById(payment.booking);
    if (booking) {
      booking.status = 'Confirmed';
      booking.paymentStatus = 'Paid';
      await booking.save();
    }

    return {
      payment,
      booking,
      captureData: {
        id: capture.id,
        status: capture.status,
        amount: capture.amount,
        createTime: capture.create_time
      }
    };

  } catch (error) {
    console.error('PayPal capture error:', error.response?.data || error.message);
    
    // Update payment status to failed if it exists
    try {
      const payment = await Payment.findOne({ paypalOrderId: orderId });
      if (payment) {
        payment.status = 'FAILED';
        payment.metadata = {
          ...payment.metadata,
          captureError: error.response?.data || error.message,
          failedAt: new Date().toISOString()
        };
        await payment.save();
      }
    } catch (updateError) {
      console.error('Failed to update payment status:', updateError);
    }
    
    throw new Error('Failed to capture PayPal payment');
  }
};

// Get PayPal order details
export const getPayPalOrderDetails = async (orderId) => {
  try {
    const accessToken = await getPayPalAccessToken();
    
    const response = await axios.get(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('PayPal order details error:', error.response?.data || error.message);
    throw new Error('Failed to get PayPal order details');
  }
};

// Refund PayPal payment
export const refundPayPalPayment = async (paymentId, userId, userRole) => {
  try {
    const payment = await Payment.findById(paymentId).populate('booking');
    if (!payment) {
      const error = new Error('Payment not found');
      error.statusCode = 404;
      throw error;
    }

    // Check authorization
    if (!payment.customer.equals(userId) && userRole === 'user') {
      const error = new Error('You can only refund your own payments');
      error.statusCode = 403;
      throw error;
    }

    if (payment.method !== 'paypal') {
      const error = new Error('Only PayPal payments can be refunded through this method');
      error.statusCode = 400;
      throw error;
    }

    if (!payment.paypalCaptureId) {
      const error = new Error('No PayPal capture ID found for this payment');
      error.statusCode = 400;
      throw error;
    }

    const accessToken = await getPayPalAccessToken();

    // Create refund
    const response = await axios.post(`${PAYPAL_API_BASE}/v2/payments/captures/${payment.paypalCaptureId}/refund`,
      {
        amount: {
          currency_code: 'USD',
          value: payment.amount.toFixed(2)
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const refundData = response.data;

    // Update payment record
    payment.metadata = {
      ...payment.metadata,
      refundId: refundData.id,
      refundStatus: refundData.status,
      refundAmount: refundData.amount,
      refundTime: refundData.create_time
    };
    await payment.save();

    // Update booking if refund is successful
    if (refundData.status === 'COMPLETED') {
      const booking = await Booking.findById(payment.booking);
      if (booking) {
        booking.paymentStatus = 'Refunded';
        booking.refundedAmount = payment.amount;
        await booking.save();
      }
    }

    return {
      refund: refundData,
      payment
    };

  } catch (error) {
    console.error('PayPal refund error:', error.response?.data || error.message);
    throw new Error('Failed to process PayPal refund');
  }
};

// Webhook handler for PayPal events
export const handlePayPalWebhook = async (webhookEvent) => {
  try {
    const eventType = webhookEvent.event_type;
    const resource = webhookEvent.resource;

    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        // Payment successfully captured
        await handlePaymentCaptureCompleted(resource);
        break;
      
      case 'PAYMENT.CAPTURE.DENIED':
        // Payment capture denied
        await handlePaymentCaptureDenied(resource);
        break;
      
      case 'CHECKOUT.ORDER.APPROVED':
        // Order approved by buyer
        await handleOrderApproved(resource);
        break;
      
      default:
        console.log(`Unhandled PayPal webhook event: ${eventType}`);
    }

    return { received: true };

  } catch (error) {
    console.error('PayPal webhook error:', error.message);
    throw new Error('Failed to process PayPal webhook');
  }
};

// Helper functions for webhook handling
const handlePaymentCaptureCompleted = async (resource) => {
  const captureId = resource.id;
  const orderId = resource.supplementary_data?.related_ids?.order_id;
  
  if (orderId) {
    await Payment.findOneAndUpdate(
      { paypalOrderId: orderId },
      { 
        status: 'SUCCESS',
        paypalCaptureId: captureId,
        metadata: {
          webhookProcessed: true,
          webhookEvent: 'PAYMENT.CAPTURE.COMPLETED'
        }
      }
    );
  }
};

const handlePaymentCaptureDenied = async (resource) => {
  const orderId = resource.supplementary_data?.related_ids?.order_id;
  
  if (orderId) {
    await Payment.findOneAndUpdate(
      { paypalOrderId: orderId },
      { 
        status: 'FAILED',
        metadata: {
          webhookProcessed: true,
          webhookEvent: 'PAYMENT.CAPTURE.DENIED',
          denialReason: resource.status_details?.reason
        }
      }
    );
  }
};

const handleOrderApproved = async (resource) => {
  const orderId = resource.id;
  
  await Payment.findOneAndUpdate(
    { paypalOrderId: orderId },
    { 
      metadata: {
        webhookProcessed: true,
        webhookEvent: 'CHECKOUT.ORDER.APPROVED',
        orderStatus: resource.status
      }
    }
  );
};

export default {
  createPayPalOrder,
  capturePayPalPayment,
  getPayPalOrderDetails,
  refundPayPalPayment,
  handlePayPalWebhook
};
