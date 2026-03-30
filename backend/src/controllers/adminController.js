import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import User from "../models/User.js";

const USD_TO_VND = 25000;

export const getDashboardStats = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      todayBookings,
      todayRevenueData,
      totalRooms,
      occupiedRooms,
      pendingBookings,
      last7DaysRevenueData,
      recentBookings
    ] = await Promise.all([
      // 1. num booking created today
      Booking.countDocuments({
        createdAt: { $gte: startOfToday, $lte: endOfToday }
      }),

      // 2. total revenue of booking confirmed today
      Booking.aggregate([
        {
          $match: {
            status: { $in: ["Confirmed", "CheckedIn", "CheckedOut"] },
            createdAt: { $gte: startOfToday, $lte: endOfToday }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalPrice" }
          }
        }
      ]),

      // 3a. total active rooms
      Room.countDocuments({ isActive: true }),

      // 3b. num booking active today
      Booking.countDocuments({
        status: { $in: ["Confirmed", "CheckedIn"] },
        checkIn: { $lte: endOfToday },
        checkOut: { $gte: startOfToday }
      }),

      // 4. num booking pending
      Booking.countDocuments({ status: "Pending" }),

      // 5. revenue of last 7 days
      Booking.aggregate([
        {
          $match: {
            status: { $in: ["Confirmed", "CheckedIn", "CheckedOut"] },
            createdAt: { $gte: sevenDaysAgo }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$totalPrice" }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // 6. 5 booking new
      Booking.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("customer", "name")
        .populate("room", "roomNumber")
    ]);

    const todayRevenue = (todayRevenueData[0]?.total || 0) * USD_TO_VND;
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

    // Build last 7 days revenue array with all dates
    const last7DaysRevenue = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split("T")[0];
      const found = last7DaysRevenueData.find((item) => item._id === dateStr);
      last7DaysRevenue.push({
        date: dateStr,
        revenue: (found?.revenue || 0) * USD_TO_VND
      });
    }

    res.status(200).json({
      success: true,
      data: {
        todayBookings,
        todayRevenue,
        occupancyRate: Math.round(occupancyRate * 10) / 10,
        pendingBookings,
        last7DaysRevenue,
        recentBookings: recentBookings.map((b) => ({
          id: b._id,
          guestName: b.customer?.fullName || "N/A", // Changed from .name to .fullName
          room: b.room?.roomNumber || "N/A",
          status: b.status
        }))
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const query = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const [users, totalCount] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: users,
      totalCount,
      page,
      limit
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot change your own role" });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (id === req.user._id.toString() && isActive === false) {
      return res.status(400).json({ success: false, message: "You cannot deactivate yourself" });
    }

    const user = await User.findByIdAndUpdate(id, { isActive }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCalendarBookings = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "startDate and endDate are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get all rooms (active)
    const rooms = await Room.find({ isActive: true }).populate("roomType", "name");

    // Fetch bookings in the date range
    // Overlapping logic: (bookingStart < rangeEnd) AND (bookingEnd > rangeStart)
    const bookings = await Booking.find({
      checkIn: { $lt: end },
      checkOut: { $gt: start }
    }).populate("customer", "fullName");

    // Group bookings to rooms
    const result = rooms.map((room) => {
      const roomBookings = bookings
        .filter((b) => b.room.toString() === room._id.toString())
        .map((b) => ({
          bookingId: b._id,
          guestName: b.customer?.fullName || "N/A",
          checkIn: b.checkIn,
          checkOut: b.checkOut,
          status: b.status
        }));

      return {
        roomId: room._id,
        roomName: room.roomType?.name || "N/A",
        roomNumber: room.roomNumber,
        bookings: roomBookings
      };
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
