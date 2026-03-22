import nodemailer from "nodemailer";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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
        title = "Booking đã được xác nhận";
        message = `Phòng ${data.roomName || "của bạn"} đã được xác nhận cho ngày ${data.checkIn}.`;
        link = `/my-bookings/${data.bookingId}`;
        emailHtml = `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="color: #1D9E75;">Xác nhận đặt phòng thành công</h1>
            <p>Chào <b>${user.fullName}</b>,</p>
            <p>Phòng <b>${data.roomName}</b> của bạn đã được xác nhận.</p>
            <p><b>Ngày nhận phòng:</b> ${data.checkIn}</p>
            <p><b>Tổng cộng:</b> ${data.totalPrice?.toLocaleString()} VND</p>
            <hr/>
            <p style="font-size: 12px; color: #888;">Cảm ơn bạn đã lựa chọn dịch vụ của chúng tôi!</p>
          </div>
        `;
        break;
      case "booking_cancelled":
        title = "Booking đã bị huỷ";
        message = `Booking phòng ${data.roomName || ""} của bạn đã bị huỷ. ${data.reason ? `Lý do: ${data.reason}` : ""}`;
        link = `/my-bookings/${data.bookingId}`;
        emailHtml = `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="color: #E24B4A;">Thông báo huỷ phòng</h1>
            <p>Chào <b>${user.fullName}</b>,</p>
            <p>Booking phòng <b>${data.roomName}</b> đã bị huỷ trên hệ thống.</p>
            ${data.reason ? `<p><b>Lý do:</b> ${data.reason}</p>` : ""}
            <p>Vui lòng liên hệ bộ phận CSKH nếu bạn cần hỗ trợ thêm.</p>
          </div>
        `;
        break;
      case "payment_success":
        title = "Thanh toán thành công";
        message = `Giao dịch ${data.transactionId} số tiền ${data.amount?.toLocaleString()} VND đã được xác nhận.`;
        link = `/my-bookings/${data.bookingId}`;
        emailHtml = `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="color: #1D9E75;">Thanh toán thành công</h1>
            <p>Chào <b>${user.fullName}</b>,</p>
            <p>Hệ thống đã ghi nhận thanh toán cho booking của bạn.</p>
            <p><b>Mã GD:</b> ${data.transactionId}</p>
            <p><b>Số tiền:</b> ${data.amount?.toLocaleString()} VND</p>
            <p>Phòng của bạn hiện đã ở trạng thái đã xác nhận.</p>
          </div>
        `;
        break;
      case "refund_processed":
        title = "Hoàn tiền đã xử lý";
        message = `Số tiền ${data.amount?.toLocaleString()} VND đã được hoàn trả. Dự kiến nhận từ 3-5 ngày qua VNPay.`;
        link = `/my-bookings/${data.bookingId}`;
        emailHtml = `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="color: #BA7517;">Hoàn tiền thành công</h1>
            <p>Chào <b>${user.fullName}</b>,</p>
            <p>Yêu cầu hoàn tiền cho booking của bạn đã được xử lý.</p>
            <p><b>Số tiền hoàn:</b> ${data.amount?.toLocaleString()} VND</p>
            <p>Dự kiến tiền sẽ về tài khoản của bạn trong vòng 3-5 ngày làm việc.</p>
          </div>
        `;
        break;
    }

    const notificationPromise = Notification.create({
      user: userId,
      type,
      title,
      message,
      link
    });

    const emailPromise = (async () => {
      // Skip if credentials are not configured
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log("Email credentials not found, skipping email.");
        return;
      }
      try {
        await transporter.sendMail({
          from: `"HotelBooking" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: `[HotelBooking] ${title}`,
          html: emailHtml
        });
        console.log(`Email sent successfully to ${user.email}`);
      } catch (err) {
        console.error("Email sending failed:", err);
      }
    })();

    await Promise.all([notificationPromise, emailPromise]);
  } catch (err) {
    console.error("Notification creation failed:", err);
  }
};
