import Booking from "../models/Booking.js";
import { stripe } from "../config/stripe.js";

export const createStripeCheckoutSession = async (req, res, next) => {
  try {
    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: "Stripe is not configured on the server"
      });
    }

    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "bookingId is required"
      });
    }

    const booking = await Booking.findById(bookingId).populate("roomType");
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    if (
      booking.status !== "Pending" ||
      booking.paymentStatus !== "Pending"
    ) {
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be paid"
      });
    }

    const successUrl =
      process.env.STRIPE_SUCCESS_URL ||
      "http://localhost:5173/hotel_booking/my-bookings?payment=success";
    const cancelUrl =
      process.env.STRIPE_CANCEL_URL ||
      "http://localhost:5173/hotel_booking/my-bookings?payment=cancel";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: undefined,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Booking phòng ${booking.roomType?.name || ""}`,
              description: `Từ ${booking.checkIn.toDateString()} đến ${booking.checkOut.toDateString()}`
            },
            unit_amount: Math.round(booking.totalPrice * 100)
          },
          quantity: 1
        }
      ],
      metadata: {
        bookingId: booking._id.toString()
      },
      success_url: successUrl,
      cancel_url: cancelUrl
    });

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error) {
    next(error);
  }
};

