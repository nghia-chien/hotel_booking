import { Request, Response, NextFunction } from 'express';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import User from '../models/User.js';

const USD_TO_VND = 25000;

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [todayBookings, todayRevenueData, totalRooms, occupiedRooms, pendingBookings, last7DaysRevenueData, recentBookings] =
      await Promise.all([
        Booking.countDocuments({ createdAt: { $gte: startOfToday, $lte: endOfToday } }),
        Booking.aggregate([
          { $match: { status: { $in: ['Confirmed', 'CheckedIn', 'CheckedOut'] }, createdAt: { $gte: startOfToday, $lte: endOfToday } } },
          { $group: { _id: null, total: { $sum: '$totalPrice' } } },
        ]),
        Room.countDocuments({ isActive: true }),
        Booking.countDocuments({ status: { $in: ['Confirmed', 'CheckedIn'] }, checkIn: { $lte: endOfToday }, checkOut: { $gte: startOfToday } }),
        Booking.countDocuments({ status: 'Pending' }),
        Booking.aggregate([
          { $match: { status: { $in: ['Confirmed', 'CheckedIn', 'CheckedOut'] }, createdAt: { $gte: sevenDaysAgo } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalPrice' } } },
          { $sort: { _id: 1 } },
        ]),
        Booking.find().sort({ createdAt: -1 }).limit(5).populate('customer', 'fullName').populate('room', 'roomNumber'),
      ]);

    const todayRevenue = ((todayRevenueData[0] as any)?.total || 0) * USD_TO_VND;
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

    const last7DaysRevenue = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      const found = (last7DaysRevenueData as any[]).find((item) => item._id === dateStr);
      last7DaysRevenue.push({ date: dateStr, revenue: (found?.revenue || 0) * USD_TO_VND });
    }

    res.status(200).json({
      success: true,
      data: {
        todayBookings, todayRevenue,
        occupancyRate: Math.round(occupancyRate * 10) / 10,
        pendingBookings, last7DaysRevenue,
        recentBookings: recentBookings.map((b: any) => ({
          id: b._id, guestName: b.customer?.fullName || 'N/A',
          room: b.room?.roomNumber || 'N/A', status: b.status,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';

    const query: any = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, totalCount] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      User.countDocuments(query),
    ]);

    res.status(200).json({ success: true, data: users, totalCount, page, limit });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const currentUser = (req as any).user;

    if (id === currentUser._id.toString()) {
      res.status(400).json({ success: false, message: 'You cannot change your own role' });
      return;
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }

    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const currentUser = (req as any).user;

    if (id === currentUser._id.toString() && isActive === false) {
      res.status(400).json({ success: false, message: 'You cannot deactivate yourself' });
      return;
    }

    const user = await User.findByIdAndUpdate(id, { isActive }, { new: true });
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }

    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCalendarBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      res.status(400).json({ success: false, message: 'startDate and endDate are required' });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const rooms = await Room.find({ isActive: true }).populate('roomType', 'name');
    const bookings = await Booking.find({ checkIn: { $lt: end }, checkOut: { $gt: start } }).populate('customer', 'fullName');

    const result = rooms.map((room: any) => ({
      roomId: room._id,
      roomName: room.roomType?.name || 'N/A',
      roomNumber: room.roomNumber,
      bookings: bookings
        .filter((b: any) => b.room.toString() === room._id.toString())
        .map((b: any) => ({
          bookingId: b._id, guestName: b.customer?.fullName || 'N/A',
          checkIn: b.checkIn, checkOut: b.checkOut, status: b.status,
        })),
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
