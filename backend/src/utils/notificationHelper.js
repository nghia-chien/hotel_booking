import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { emailQueue } from "./queue.js";
import logger from "./logger.js";

export const createNotification = async (userId, type, data) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    let title = "";
    let message = "";
    let link = "";
    let emailHtml = "";

    switch (type) {
      case "booking_confirmed":
        title = "Booking Confirmed";
        message = `Room ${data.roomName || "of yours"} has been confirmed for ${data.checkIn}.`;
        link = `/my-bookings/${data.bookingId}`;
        emailHtml = `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="color: #1D9E75;">Booking Confirmed Successfully</h1>
            <p>Hi <b>${user.fullName}</b>,</p>
            <p>Your room <b>${data.roomName}</b> has been confirmed.</p>
            <p><b>Check-in Date:</b> ${data.checkIn}</p>
            <p><b>Total Price:</b> ${data.totalPrice?.toLocaleString()} USD</p>
            <hr/>
            <p style="font-size: 12px; color: #888;">Thank you for choosing our service!</p>
          </div>
        `;
        break;
      case "booking_cancelled":
        title = "Booking Cancelled";
        message = `Your booking for room ${data.roomName || ""} has been cancelled. ${data.reason ? `Reason: ${data.reason}` : ""}`;
        link = `/my-bookings/${data.bookingId}`;
        emailHtml = `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="color: #E24B4A;">Cancellation Notice</h1>
            <p>Hi <b>${user.fullName}</b>,</p>
            <p>Booking for room <b>${data.roomName}</b> has been cancelled in our system.</p>
            ${data.reason ? `<p><b>Reason:</b> ${data.reason}</p>` : ""}
            <p>Please contact customer support if you need further assistance.</p>
          </div>
        `;
        break;
      case "payment_success":
        title = "Payment Successful";
        message = `Transaction ${data.transactionId} for ${data.amount?.toLocaleString()} USD has been confirmed.`;
        link = `/my-bookings/${data.bookingId}`;
        emailHtml = `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="color: #1D9E75;">Payment Successful</h1>
            <p>Hi <b>${user.fullName}</b>,</p>
            <p>We have received the payment for your booking.</p>
            <p><b>Transaction ID:</b> ${data.transactionId}</p>
            <p><b>Amount:</b> ${data.amount?.toLocaleString()} USD</p>
            <p>Your booking status is now set to confirmed.</p>
          </div>
        `;
        break;
      case "refund_processed":
        title = "Refund Processed";
        message = `An amount of ${data.amount?.toLocaleString()} USD has been refunded. Expect to receive it within 3-5 business days.`;
        link = `/my-bookings/${data.bookingId}`;
        emailHtml = `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="color: #BA7517;">Refund Successful</h1>
            <p>Hi <b>${user.fullName}</b>,</p>
            <p>The refund request for your booking has been processed.</p>
            <p><b>Refund Amount:</b> ${data.amount?.toLocaleString()} USD</p>
            <p>The funds are expected to return to your account within 3-5 business days.</p>
          </div>
        `;
        break;
    }

    // Save notification to DB synchronously
    await Notification.create({
      user: userId,
      type,
      title,
      message,
      link
    });

    // Delegate email sending to BullMQ async job
    const jobId = data.bookingId ? `${type}:${data.bookingId}` : undefined;
    await emailQueue.add("send-email", {
      to: user.email,
      subject: `[HotelBooking] ${title}`,
      html: emailHtml
    }, {
      jobId, // Idempotency check key
      removeOnComplete: true
    });
    
    logger.info(`Notification DB saved, email job enqueued for ${user.email}`);
  } catch (err) {
    logger.error("Notification creation failed:", err);
  }
};