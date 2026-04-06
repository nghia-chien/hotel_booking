import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { paymentController } from '../modules/payment/index.js';

const router = express.Router();

router.post('/vnpay/create-order', authenticate, paymentController.createVNPayOrder);
router.get('/vnpay/return', paymentController.handleVNPayReturn);
router.get('/my', authenticate, paymentController.getMyPayments);

export default router;
