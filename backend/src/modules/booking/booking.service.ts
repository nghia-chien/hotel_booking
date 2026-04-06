import { BookingRepository, IBooking, CreateBookingDto, SearchRoomsDto } from './booking.types.js';
import { AppError } from '../../core/errors/AppError.js';
import { logger } from '../../core/utils/logger.js';
import Room from '../../models/Room.js';
import RoomType from '../../models/RoomType.js';
import Payment from '../../models/Payment.js';
import PricingRule from '../../models/PricingRule.js';
import { format } from 'date-fns';
import { createNotification } from '../../utils/notificationHelper.js';
import { refundVNPayPayment, getClientIp } from '../../services/vnpayService.js';

const CANCELLATION_HOURS = 24;
const DEFAULT_REFUND_PERCENTAGE = 100;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export class BookingService {
  constructor(private readonly bookingRepo: BookingRepository) {}

  private async calculateBookingPrice(roomTypeId: string, checkIn: Date, checkOut: Date): Promise<number> {
    const roomType = await RoomType.findById(roomTypeId);
    if (!roomType) {
      throw new AppError('Room type not found', 404, 'ROOM_TYPE_NOT_FOUND');
    }

    const rules = await PricingRule.find({
      roomType: roomTypeId,
      startDate: { $lte: checkOut },
      endDate: { $gte: checkIn }
    });

    const eachDay = (start: Date, end: Date) => {
      const days: Date[] = [];
      let current = new Date(start);
      while (current < end) {
        days.push(new Date(current));
        current = new Date(current.getTime() + MS_PER_DAY);
      }
      return days;
    };

    const isWeekend = (date: Date) => {
      const day = date.getUTCDay();
      return day === 0 || day === 6;
    };

    const days = eachDay(checkIn, checkOut);
    let total = 0;

    for (const day of days) {
      let price = roomType.basePrice || 0;
      const applicableRules = rules.filter((rule: any) => {
        const inRange = day >= rule.startDate && day <= rule.endDate;
        if (!inRange) return false;
        if (rule.applyWeekend && !isWeekend(day)) return false;
        return true;
      });

      applicableRules.forEach((rule: any) => {
        if (rule.priceType === "fixed") {
          price += rule.value;
        } else if (rule.priceType === "percentage") {
          price += (price * rule.value) / 100;
        }
      });
      total += price;
    }
    return total;
  }

  async createBooking(userId: string, dto: CreateBookingDto): Promise<IBooking> {
    const room = await (Room as any).findById(dto.roomId).populate("roomType");
    if (!room || !room.isActive) {
      throw new AppError("Invalid or inactive room", 400, "INVALID_ROOM");
    }

    if (dto.guests > room.capacity) {
      throw new AppError("Guests exceed room capacity", 400, "EXCEED_CAPACITY");
    }

    const checkIn = new Date(dto.checkIn);
    const checkOut = new Date(dto.checkOut);

    const conflict = await this.bookingRepo.exists({
      room: room._id,
      status: { $in: ["Pending", "Confirmed", "CheckedIn"] },
      checkIn: { $lt: checkOut },
      checkOut: { $gt: checkIn }
    });

    if (conflict) {
      throw new AppError("Room is already booked for the selected dates", 409, "ROOM_CONFLICT");
    }

    const totalPrice = await this.calculateBookingPrice(room.roomType._id, checkIn, checkOut);
    const cancellationDeadline = new Date(checkIn.getTime() - CANCELLATION_HOURS * 60 * 60 * 1000);

    const booking = await this.bookingRepo.create({
      customer: userId as any,
      room: room._id,
      roomType: room.roomType._id,
      checkIn,
      checkOut,
      guests: dto.guests,
      totalPrice,
      status: "Pending",
      paymentStatus: "Pending",
      specialRequest: dto.specialRequest,
      cancellationDeadline,
      refundPercentage: DEFAULT_REFUND_PERCENTAGE
    });

    logger.info('Booking created', { bookingId: (booking as any)._id, userId });
    return booking;
  }

  async searchAvailableRooms(query: SearchRoomsDto): Promise<{ paged: any[], total: number }> {
    const roomFilter: any = {
      isActive: true,
      capacity: { $gte: query.guests }
    };
    if (query.roomType) {
      roomFilter.roomType = query.roomType;
    }

    const allRooms = await Room.find(roomFilter).populate("roomType");
    const roomIds = allRooms.map((r: any) => r._id);

    if (!roomIds.length) {
      return { paged: [], total: 0 };
    }

    const checkInDate = new Date(query.checkIn);
    const checkOutDate = new Date(query.checkOut);

    const overlappingBookings = await this.bookingRepo.find({
      room: { $in: roomIds },
      status: { $in: ["Pending", "Confirmed", "CheckedIn"] },
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate }
    }, { projection: 'room' });

    const bookedRoomIds = new Set(overlappingBookings.map((b: any) => b.room.toString()));
    const availableRooms = allRooms.filter((room: any) => !bookedRoomIds.has(room._id.toString()));

    const roomsWithPrice = await Promise.all(
      availableRooms.map(async (room: any) => {
        const totalPrice = await this.calculateBookingPrice(room.roomType._id, checkInDate, checkOutDate);
        return { room, totalPrice };
      })
    );

    let filtered = roomsWithPrice;
    if (query.minPrice !== undefined && query.minPrice !== null) {
      filtered = filtered.filter((r: any) => r.totalPrice >= query.minPrice!);
    }
    if (query.maxPrice !== undefined && query.maxPrice !== null) {
      filtered = filtered.filter((r: any) => r.totalPrice <= query.maxPrice!);
    }

    // Sorting and pagination should ideally be done here in service
    return { paged: filtered, total: filtered.length };
  }

  async payBooking(userId: string, userRole: string, id: string, paymentData: any): Promise<{ booking: IBooking, payment: any }> {
    const booking = await this.bookingRepo.findById(id);
    if (!booking) throw new AppError("Booking not found", 404, "BOOKING_NOT_FOUND");

    const customerId = (booking.customer as any)._id || booking.customer;
    if (customerId.toString() !== userId && userRole === "user") {
      throw new AppError("You can only pay your own bookings", 403, "ACCESS_DENIED");
    }

    if (booking.status !== "Pending") {
      throw new AppError("Only pending bookings can be paid", 400, "INVALID_STATUS");
    }

    const { method = "mock", cardLast4 } = paymentData || {};
    const transactionId = `MOCK-${Date.now()}`;

    const payment = await Payment.create({
      booking: booking._id,
      customer: booking.customer,
      amount: booking.totalPrice,
      method,
      status: "SUCCESS",
      transactionId,
      metadata: { cardLast4 }
    });

    const updatedBooking = await this.bookingRepo.update(id, {
      status: "Confirmed",
      paymentStatus: "Paid"
    });

    if (!updatedBooking) throw new AppError("Failed to update booking status", 500);

    // Notify User
    const roomNotify = await Room.findById(booking.room).populate("roomType");
    void createNotification(booking.customer.toString(), "payment_success", {
      transactionId,
      amount: booking.totalPrice,
      bookingId: booking._id.toString()
    });
    void createNotification(booking.customer.toString(), "booking_confirmed", {
      roomName: (roomNotify as any)?.roomNumber || "Phòng",
      checkIn: format(booking.checkIn, "dd/MM/yyyy"),
      totalPrice: booking.totalPrice,
      bookingId: booking._id.toString()
    });

    return { booking: updatedBooking, payment };
  }

  async getAllBookings(options: any): Promise<{ items: IBooking[], total: number }> {
    const [items, total] = await Promise.all([
      this.bookingRepo.find({}, options),
      this.bookingRepo.count({})
    ]);
    return { items, total };
  }

  async getMyBookings(userId: string, options: any): Promise<{ items: IBooking[], total: number }> {
    const filter = { customer: userId };
    const [items, total] = await Promise.all([
      this.bookingRepo.find(filter, options),
      this.bookingRepo.count(filter)
    ]);
    return { items, total };
  }

  async getBookingById(userId: string, userRole: string, id: string): Promise<IBooking> {
    const booking = await this.bookingRepo.findById(id);
    if (!booking) {
      throw new AppError("Booking not found", 404, "BOOKING_NOT_FOUND");
    }

    const customerId = (booking.customer as any)._id || booking.customer;
    if (customerId.toString() !== userId && userRole === "user") {
      throw new AppError("Access denied", 403, "ACCESS_DENIED");
    }

    return booking;
  }

  async cancelBooking(userId: string, userRole: string, id: string, reason?: string, req?: any): Promise<IBooking> {
    const booking = await this.bookingRepo.findById(id);
    if (!booking) {
      throw new AppError("Booking not found", 404, "BOOKING_NOT_FOUND");
    }

    const isAdminOrStaff = userRole === "admin" || userRole === "staff";
    const customerId = (booking.customer as any)._id || booking.customer;

    if (customerId.toString() !== userId && !isAdminOrStaff) {
      throw new AppError("You can only cancel your own bookings", 403, "FORBIDDEN");
    }

    if (booking.status !== "Pending" && booking.status !== "Confirmed") {
      throw new AppError("Only pending or confirmed bookings can be cancelled", 400, "INVALID_STATUS");
    }

    const now = new Date();
    const refundPercentage = booking.refundPercentage ?? 100;
    const wasAlreadyPaid = booking.paymentStatus === "Paid";
    const refundedAmount = wasAlreadyPaid ? (booking.totalPrice * refundPercentage) / 100 : 0;

    const updateData: Partial<IBooking> = {
      status: "Cancelled",
      paymentStatus: wasAlreadyPaid && refundedAmount > 0 ? "Refunded" : booking.paymentStatus,
      cancelledAt: now,
      refundedAmount: refundedAmount
    };

    const updatedBooking = await this.bookingRepo.update(id, updateData);
    if (!updatedBooking) throw new AppError("Failed to update booking", 500);

    // Notify User
    const roomNotify = await (Room as any).findById(booking.room);
    void createNotification(booking.customer.toString(), "booking_cancelled", {
      roomName: roomNotify?.roomNumber || "Phòng",
      bookingId: (updatedBooking as any)._id,
      reason: reason || (isAdminOrStaff ? "Huỷ bởi quản trị viên" : "Huỷ theo yêu cầu")
    });

    if (wasAlreadyPaid && refundedAmount > 0) {
      // Find original payment
      const originalPayment = await (Payment as any).findOne({
        $or: [
          { booking: booking._id, status: "SUCCESS" },
          { bookings: booking._id, status: "SUCCESS" }
        ],
        method: { $ne: "refund" }
      }).sort({ createdAt: -1 });

      if (originalPayment?.method === "vnpay" && req) {
        try {
          const ipAddr = getClientIp(req);
          await refundVNPayPayment(originalPayment._id.toString(), userId, userRole, refundedAmount, ipAddr);
          void createNotification(booking.customer.toString(), "refund_processed", { amount: refundedAmount, bookingId: booking._id.toString() });
        } catch (err: any) {
          logger.error("VNPay refund failed", { error: err.message, bookingId: booking._id });
        }
      } else {
        // Manual refund record
        await (Payment as any).create({
          booking: booking._id,
          customer: booking.customer,
          amount: refundedAmount,
          method: "refund",
          status: "SUCCESS",
          transactionId: `REFUND-${Date.now()}`,
          metadata: { refundPercentage, cancelledAt: now.toISOString(), cancelledBy: userId, originalPaymentId: originalPayment?._id }
        });
        void createNotification(booking.customer.toString(), "refund_processed", { amount: refundedAmount, bookingId: booking._id.toString() });
      }
    }

    logger.info('Booking cancelled', { bookingId: id, userId });
    return updatedBooking;
  }
}
