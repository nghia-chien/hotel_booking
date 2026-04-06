import { 
  VNPay, 
  ProductCode, 
  VnpLocale, 
  ignoreLogger, 
  HashAlgorithm 
} from 'vnpay';
import { PaymentRepository, IPayment } from './payment.types.js';
import { AppError } from '../../core/errors/AppError.js';
import { logger } from '../../core/utils/logger.js';
import Booking from '../../models/Booking.js';
import { createNotification } from '../../utils/notificationHelper.js';
import { format } from 'date-fns';

const USD_TO_VND = 25000;

export class PaymentService {
  private vnpay: VNPay;

  constructor(private readonly paymentRepo: PaymentRepository) {
    this.vnpay = new VNPay({
      tmnCode: process.env.VNP_TMNCODE || '',
      secureSecret: process.env.VNP_HASHSECRET || '',
      vnpayHost: 'https://sandbox.vnpayment.vn',
      testMode: process.env.NODE_ENV !== 'production',
      hashAlgorithm: HashAlgorithm.SHA512,
      enableLog: process.env.NODE_ENV === 'development',
      loggerFn: ignoreLogger,
    });
  }

  async createVNPayOrder(bookingIds: string | string[], userId: string, ipAddr: string, baseUrl: string): Promise<any> {
    const ids = Array.isArray(bookingIds) ? bookingIds : [bookingIds];
    if (!ids.length) throw new AppError('bookingIds are required', 400);

    const bookings = await Booking.find({
      _id: { $in: ids },
      customer: userId,
      status: 'Pending',
    });

    if (!bookings.length) throw new AppError('No pending bookings found', 404);

    const totalUSD = bookings.reduce((sum: number, b: any) => sum + b.totalPrice, 0);
    const amount = Math.round(totalUSD * USD_TO_VND);

    if (amount < 5000) throw new AppError(`Số tiền quá nhỏ (${amount} VNĐ). Tối thiểu 5,000 VNĐ.`, 400);

    const txnRef = `BK${Date.now()}`;

    // Create payment record
    const payment = await this.paymentRepo.create({
      booking: ids[0] as any,
      bookings: ids as any,
      customer: userId as any,
      amount: totalUSD,
      method: 'vnpay',
      status: 'PENDING',
      transactionId: txnRef,
      metadata: { bookingIds, amountVND: amount, amountUSD: totalUSD },
    });

    const paymentUrl = this.vnpay.buildPaymentUrl({
      vnp_Amount: amount,
      vnp_IpAddr: ipAddr,
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toan ${bookings.length} phong - ${txnRef}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: `${baseUrl}/api/payments/vnpay/return`,
      vnp_Locale: VnpLocale.VN,
    });

    logger.info('VNPay order created', { txnRef, userId, amount });

    return { paymentUrl, txnRef, paymentId: (payment as any)._id };
  }

  async handleVNPayReturn(query: any): Promise<any> {
    const verification = this.vnpay.verifyReturnUrl(query);
    const txnRef = query.vnp_TxnRef;

    if (!verification.isSuccess) {
      await this.paymentRepo.findOne({ transactionId: txnRef }).then(p => {
        if (p) this.paymentRepo.update((p as any)._id.toString(), { status: 'FAILED' });
      });
      return { isSuccess: false, responseCode: query.vnp_ResponseCode };
    }

    const payment = await this.paymentRepo.findOne({ transactionId: txnRef });
    if (!payment) return { isSuccess: false, responseCode: '02' };
    if (payment.status === 'SUCCESS') return { isSuccess: true, alreadyProcessed: true };

    await this.paymentRepo.update((payment as any)._id.toString(), {
      status: 'SUCCESS',
      metadata: { ...payment.metadata, vnpResponseCode: query.vnp_ResponseCode }
    });

    // Update bookings
    const bookingIds = payment.bookings?.length ? payment.bookings : [payment.booking!];
    const bookings = await Booking.find({ _id: { $in: bookingIds } }).populate('room');
    
    await Promise.all(bookings.map(async (b: any) => {
      if (b.status === 'Pending') {
        b.status = 'Confirmed';
        b.paymentStatus = 'Paid';
        await b.save();

        void createNotification(b.customer!.toString(), 'payment_success', {
          transactionId: query.vnp_TransactionNo,
          amount: b.totalPrice,
          bookingId: b._id
        });
      }
    }));

    return { isSuccess: true, paymentId: (payment as any)._id.toString() };
  }

  async getMyPayments(userId: string): Promise<IPayment[]> {
    return await this.paymentRepo.find({ customer: userId }, { sort: { createdAt: -1 } });
  }
}
