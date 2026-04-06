import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import { createNotification } from '../utils/notificationHelper.js';

export const startBookingCron = (): void => {
  setInterval(async () => {
    try {
      const expirationTime = new Date(Date.now() - 15 * 60 * 1000);

      const expiredBookings = await Booking.find({
        status: 'Pending',
        paymentStatus: 'Pending',
        createdAt: { $lt: expirationTime },
      });

      if (expiredBookings.length > 0) {
        const bookingIds = expiredBookings.map((b) => b._id);

        await Booking.updateMany(
          { _id: { $in: bookingIds } },
          { $set: { status: 'Cancelled', cancelledAt: new Date() } }
        );

        await Payment.updateMany(
          {
            $or: [{ booking: { $in: bookingIds } }, { bookings: { $in: bookingIds } }],
            status: 'PENDING',
          },
          { $set: { status: 'FAILED', 'metadata.reason': 'Auto cancelled due to timeout' } }
        );

        for (const b of expiredBookings) {
          void createNotification(b.customer.toString(), 'booking_cancelled', {
            roomName: 'Phòng của bạn',
            bookingId: (b._id as any).toString(),
            reason: 'Hết thời gian chờ thanh toán (15 phút)',
          });
        }

        console.log(`[Cron] Auto Cancelled ${expiredBookings.length} booking(s) and their pending payments`);
      }

      const paymentSweepResult = await Payment.updateMany(
        { status: 'PENDING', createdAt: { $lt: expirationTime } },
        { $set: { status: 'FAILED', 'metadata.reason': 'Auto cancelled payment due to 15m timeout' } }
      );

      if (paymentSweepResult.modifiedCount > 0) {
        console.log(`[Cron] Auto Cancelled ${paymentSweepResult.modifiedCount} orphaned pending payment(s)`);
      }
    } catch (error) {
      console.error('[Cron] Error when auto cancelling booking/payment:', error);
    }
  }, 60 * 1000);
};
