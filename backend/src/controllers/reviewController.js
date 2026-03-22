import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import Room from "../models/Room.js";

export const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId).populate("room");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to review this stay" });
    }

    if (booking.status !== "CheckedOut") {
      return res.status(400).json({ success: false, message: "Only checked-out stays can be reviewed" });
    }

    // Create review
    const review = await Review.create({
      booking: bookingId,
      user: req.user._id,
      room: booking.room._id,
      roomType: booking.room.roomType,
      rating,
      comment
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "You have already reviewed this stay" });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getRoomReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const [reviews, totalCount, room] = await Promise.all([
      Review.find({ room: id, isVisible: true })
        .populate("user", "fullName")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Review.countDocuments({ room: id, isVisible: true }),
      Room.findById(id).select("avgRating totalReviews")
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
      totalCount,
      avgRating: room?.avgRating || 0,
      totalReviews: room?.totalReviews || 0,
      page,
      limit
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllReviewsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const [reviews, totalCount] = await Promise.all([
      Review.find()
        .populate("user", "fullName email")
        .populate("room", "roomNumber")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Review.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
      totalCount,
      page,
      limit
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleReviewVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVisible } = req.body;

    const review = await Review.findByIdAndUpdate(id, { isVisible }, { new: true });
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    // Trigger stats update
    await Review.updateStats(review.room, review.roomType);

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const checkReviewStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const review = await Review.findOne({ booking: bookingId, user: req.user._id });
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
