import { MongoBookingRepository } from './booking.repository.js';
import { BookingService } from './booking.service.js';
import { BookingController } from './booking.controller.js';

const bookingRepository = new MongoBookingRepository();
const bookingService = new BookingService(bookingRepository);
const bookingController = new BookingController(bookingService);

export { bookingController, bookingService, bookingRepository };
