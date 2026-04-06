import express, { Request, Response, NextFunction } from 'express';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import { calculateBookingPrice } from '../utils/pricing.js';

const router = express.Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rooms = await Room.find({ isActive: true }).populate('roomType');
    res.json({ success: true, data: rooms });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const room = await Room.findById(req.params.id).populate('roomType');
    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }
    res.json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/price', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { checkIn, checkOut, guests } = req.query;
    if (!checkIn || !checkOut || !guests) {
      res.status(400).json({ success: false, message: 'checkIn, checkOut, guests are required' });
      return;
    }

    const checkInDate = new Date(checkIn as string);
    const checkOutDate = new Date(checkOut as string);
    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
      res.status(400).json({ success: false, message: 'Invalid checkIn/checkOut date' });
      return;
    }
    if (checkOutDate <= checkInDate) {
      res.status(400).json({ success: false, message: 'checkOut must be after checkIn' });
      return;
    }

    const guestsNumber = Number(guests);
    if (!Number.isFinite(guestsNumber) || guestsNumber < 1) {
      res.status(400).json({ success: false, message: 'Invalid guests' });
      return;
    }

    const room = await Room.findById(req.params.id).populate('roomType');
    if (!room) { res.status(404).json({ success: false, message: 'Room not found' }); return; }
    if (!room.isActive) { res.status(400).json({ success: false, message: 'Room is inactive' }); return; }
    if (guestsNumber > room.capacity) {
      res.status(400).json({ success: false, message: 'Guests exceed room capacity' });
      return;
    }

    const totalPrice = await calculateBookingPrice((room.roomType as any)._id, checkInDate, checkOutDate);
    const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (24 * 60 * 60 * 1000)));

    res.json({ success: true, data: { totalPrice, nights, pricePerNight: totalPrice / nights } });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/booked-dates', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) { res.status(404).json({ success: false, message: 'Room not found' }); return; }

    const bookings = await Booking.find({
      room: room._id,
      status: { $in: ['Pending', 'Confirmed', 'CheckedIn'] },
      checkOut: { $gte: new Date() },
    }).select('checkIn checkOut');

    res.json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
});

export default router;
