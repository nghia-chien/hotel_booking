import Booking from "../models/Booking.js";

export const startBookingCron = () => {
  // Run every 1 minute to check and cancel
  setInterval(async () => {
    try {
      // Get the time 15 minutes ago
      const expirationTime = new Date(Date.now() - 15 * 60 * 1000);
      
      // Update pending bookings created before that time
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
  }, 60 * 1000); 
};
