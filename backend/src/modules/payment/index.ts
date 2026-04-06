import { MongoPaymentRepository } from './payment.repository.js';
import { PaymentService } from './payment.service.js';
import { PaymentController } from './payment.controller.js';

const paymentRepository = new MongoPaymentRepository();
const paymentService = new PaymentService(paymentRepository);
const paymentController = new PaymentController(paymentService);

export { paymentRepository, paymentService, paymentController };
