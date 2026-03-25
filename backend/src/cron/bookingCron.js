import Booking from "../models/Booking.js";

export const startBookingCron = () => {
  // Chạy mỗi 1 phút để kiểm tra và tiến hành hủy
  setInterval(async () => {
    try {
      // Lấy thời điểm 15 phút trước
      const expirationTime = new Date(Date.now() - 15 * 60 * 1000);
      
      // Update các booking đang Pending được tạo trước thời gian đó
      const result = await Booking.updateMany(
        {
          status: "Pending",
          paymentStatus: "Pending",
          createdAt: { $lt: expirationTime }
        },
        {
          $set: {
            status: "Cancelled",
            cancelledAt: new Date()
          }
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`[Cron] Đã tự động hủy ${result.modifiedCount} booking do quá hạn thanh toán (15 phút).`);
      }
    } catch (error) {
      console.error("[Cron] Lỗi khi quét tự động hủy booking:", error);
    }
  }, 60 * 1000); // 1 phút
};
