import cron from "node-cron";
import { expireOldBookingsService } from "../services/bookingService.js";

/**
 * Cron job to run every minute and expire PENDING bookings 
 * that have reached the 10-minute hold threshold.
 */
export const initBookingExpiryCron = () => {
  // Runs every minute
  cron.schedule("* * * * *", async () => {
    try {
      const expiredCount = await expireOldBookingsService();
      if (expiredCount.length > 0) {
        console.log(`[Cron] Expired ${expiredCount.length} pending bookings.`);
      }
    } catch (error) {
      console.error("[Cron Error] Booking Expiry Task failed:", error.message);
    }
  });
  
  console.log("[Cron] Booking Expiry Task initialized (1 min interval)");
};
