import {
  VNPay,
  ProductCode,
  VnpLocale,
  ignoreLogger,
  HashAlgorithm,
} from "vnpay";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Lấy IP thực của client, chuẩn hoá IPv6 loopback về 127.0.0.1 */
export const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return first.split(",")[0].trim();
  }
  const raw = req.socket?.remoteAddress || req.ip || "127.0.0.1";
  // Chuẩn hoá IPv6 loopback
  if (raw === "::1" || raw === "::ffff:127.0.0.1") return "127.0.0.1";
  if (raw.startsWith("::ffff:")) return raw.slice(7);
  return raw;
};

// ─── Khởi tạo VNPay instance ──────────────────────────────────────────────────

const vnpay = new VNPay({
  tmnCode: process.env.VNP_TMNCODE,
  secureSecret: process.env.VNP_HASHSECRET,
  vnpayHost: "https://sandbox.vnpayment.vn",
  testMode: process.env.NODE_ENV !== "production",
  hashAlgorithm: HashAlgorithm.SHA512,
  enableLog: process.env.NODE_ENV === "development",
  loggerFn: ignoreLogger,
});

// USD → VNĐ (totalPrice trong DB lưu USD)
const USD_TO_VND = 25000;

// ─── 1. Tạo payment URL ───────────────────────────────────────────────────────

/**
 * Tạo VNPay payment URL cho một hoặc nhiều booking.
 * @param {string|string[]} bookingIds
 * @param {string} userId
 * @param {string} ipAddr  - IP của khách (lấy từ request)
 * @param {string} baseUrl - Base URL của backend (e.g. http://localhost:3000)
 * @returns {{ paymentUrl: string, txnRef: string, paymentId: string }}
 */
export const createVNPayOrder = async (bookingIds, userId, ipAddr, baseUrl) => {
  const ids = Array.isArray(bookingIds) ? bookingIds : [bookingIds];
  if (!ids.length) {
    const err = new Error("bookingIds are required");
    err.statusCode = 400;
    throw err;
  }

  // Validate bookings
  const bookings = await Booking.find({
    _id: { $in: ids },
    customer: userId,
    status: "Pending",
  });

  if (!bookings.length) {
    const err = new Error("No pending bookings found");
    err.statusCode = 404;
    throw err;
  }

  const foundIds = new Set(bookings.map((b) => b._id.toString()));
  const missing  = ids.filter((id) => !foundIds.has(String(id)));
  if (missing.length) {
    const err = new Error("Some bookings cannot be paid (not found or not pending)");
    err.statusCode = 400;
    throw err;
  }

  // Convert USD → VNĐ, VNPay nhận VNĐ nguyên (thư viện tự × 100)
  const totalUSD = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const amount   = Math.round(totalUSD * USD_TO_VND);

  if (amount < 5000) {
    const err = new Error(`Số tiền quá nhỏ (${amount} VNĐ). Tối thiểu 5,000 VNĐ.`);
    err.statusCode = 400;
    throw err;
  }

  const txnRef = `BK${Date.now()}`;

  // Tạo Payment record PENDING trước
  const payment = await Payment.create({
    booking      : ids[0],
    bookings     : ids,
    customer     : userId,
    amount       : totalUSD,        // lưu USD gốc trong DB
    method       : "vnpay",
    status       : "PENDING",
    transactionId: txnRef,
    vnpTxnRef    : txnRef,
    metadata: {
      bookingIds,
      amountVND : amount,
      amountUSD : totalUSD,
      createTime: new Date().toISOString(),
    },
  });

  // Thư viện tự build params + ký hash
  const paymentUrl = vnpay.buildPaymentUrl({
    // VNPay library automatically multiplies amount by 100, so provide amount in VND divided by 100
    vnp_Amount    : Math.round(amount / 100),
    vnp_IpAddr    : ipAddr,
    vnp_TxnRef    : txnRef,
    vnp_OrderInfo : `Thanh toan ${bookings.length} phong - ${txnRef}`,
    vnp_OrderType : ProductCode.Other,
    vnp_ReturnUrl : `${baseUrl}/api/payments/vnpay/return`,
    vnp_Locale    : VnpLocale.VN,
  });

  console.log(`[VNPay] txnRef=${txnRef} | USD=${totalUSD} | VND=${amount} | IP=${ipAddr}`);

  return { paymentUrl, txnRef, paymentId: payment._id };
};

// ─── 2. Xử lý return URL (backend redirect) ───────────────────────────────────

/**
 * Verify params VNPay gửi về GET /api/payments/vnpay/return
 * Cập nhật DB rồi trả về { isSuccess, orderId, responseCode }
 * để controller redirect về đúng trang frontend.
 * @param {object} query  - req.query từ VNPay redirect
 */
export const handleVNPayReturn = async (query) => {
  const verification = vnpay.verifyReturnUrl(query);
  const txnRef       = query.vnp_TxnRef;
  const transactionNo = query.vnp_TransactionNo;

  if (!verification.isSuccess) {
    console.log("[VNPay] Return verify failed:", verification.message);
    // Huỷ payment record nếu có
    await Payment.findOneAndUpdate(
      { vnpTxnRef: txnRef, status: "PENDING" },
      { $set: { status: "FAILED", metadata: { vnpResponseCode: query.vnp_ResponseCode } } }
    );
    return { isSuccess: false, responseCode: query.vnp_ResponseCode };
  }

  // Idempotency — đã xử lý rồi
  const existing = await Payment.findOne({ vnpTxnRef: txnRef, status: "SUCCESS" });
  if (existing) {
    console.log(`[VNPay] Return idempotent: txnRef=${txnRef}`);
    return { isSuccess: true, alreadyProcessed: true };
  }

  // Tìm payment record
  const payment = await Payment.findOne({ vnpTxnRef: txnRef });
  if (!payment) {
    console.log(`[VNPay] Return: payment not found for txnRef=${txnRef}`);
    return { isSuccess: false, responseCode: "02" };
  }

  // Cập nhật payment
  payment.status           = "SUCCESS";
  payment.vnpTransactionNo = transactionNo;
  payment.metadata         = {
    ...payment.metadata,
    vnpResponseCode : query.vnp_ResponseCode,
    vnpTransactionNo: transactionNo,
    vnpBankCode     : query.vnp_BankCode,
    vnpCardType     : query.vnp_CardType,
    vnpPayDate      : query.vnp_PayDate,
    processedAt     : new Date().toISOString(),
  };
  await payment.save();

  // Cập nhật bookings
  const bookingIds = payment.bookings?.length ? payment.bookings : [payment.booking];
  const bookings   = await Booking.find({ _id: { $in: bookingIds } });
  await Promise.all(
    bookings.map(async (b) => {
      if (b.status === "Pending") {
        b.status        = "Confirmed";
        b.paymentStatus = "Paid";
        await b.save();
      }
    })
  );

  console.log(`[VNPay] Return success: txnRef=${txnRef} | bookings updated=${bookings.length}`);
  return { isSuccess: true, paymentId: payment._id.toString() };
};

// ─── 3. IPN (server-to-server, backup) ───────────────────────────────────────

/**
 * Xử lý IPN call từ VNPay server — idempotent.
 * Trả về { RspCode, Message } đúng format VNPay yêu cầu.
 * @param {object} query - req.query từ VNPay IPN
 */
export const handleVNPayIpn = async (query) => {
  const verification = vnpay.verifyIpnCall(query);

  if (!verification.isSuccess) {
    console.log("[VNPay] IPN verify failed:", verification.message);
    return { RspCode: "97", Message: "Invalid signature" };
  }

  const txnRef        = query.vnp_TxnRef;
  const transactionNo = query.vnp_TransactionNo;

  // Idempotency
  const existing = await Payment.findOne({ vnpTxnRef: txnRef, status: "SUCCESS" });
  if (existing) {
    console.log(`[VNPay] IPN idempotent: txnRef=${txnRef}`);
    return { RspCode: "00", Message: "Success" };
  }

  const payment = await Payment.findOne({ vnpTxnRef: txnRef });
  if (!payment) {
    console.log(`[VNPay] IPN: payment not found txnRef=${txnRef}`);
    return { RspCode: "01", Message: "Order not found" };
  }

  // Cập nhật payment
  payment.status           = "SUCCESS";
  payment.vnpTransactionNo = transactionNo;
  payment.metadata         = {
    ...payment.metadata,
    vnpResponseCode : query.vnp_ResponseCode,
    vnpTransactionNo: transactionNo,
    vnpBankCode     : query.vnp_BankCode,
    vnpCardType     : query.vnp_CardType,
    vnpPayDate      : query.vnp_PayDate,
    processedAt     : new Date().toISOString(),
    source          : "ipn",
  };
  await payment.save();

  // Cập nhật bookings
  const bookingIds = payment.bookings?.length ? payment.bookings : [payment.booking];
  const bookings   = await Booking.find({ _id: { $in: bookingIds } });
  await Promise.all(
    bookings.map(async (b) => {
      if (b.status === "Pending") {
        b.status        = "Confirmed";
        b.paymentStatus = "Paid";
        await b.save();
      }
    })
  );

  console.log(`[VNPay] IPN success: txnRef=${txnRef} | bookings updated=${bookings.length}`);
  return { RspCode: "00", Message: "Success" };
};

// ─── 4. Hoàn tiền ────────────────────────────────────────────────────────────

/**
 * Gửi yêu cầu hoàn tiền qua VNPay API.
 * @param {string} paymentId    - _id của Payment record
 * @param {string} userId
 * @param {string} userRole
 * @param {number} [refundAmount] - Số tiền hoàn (USD). Nếu bỏ qua → hoàn toàn bộ.
 * @param {string} ipAddr
 */
export const refundVNPayPayment = async (paymentId, userId, userRole, refundAmount, ipAddr) => {
  const payment = await Payment.findById(paymentId).populate("booking");
  if (!payment) {
    const err = new Error("Payment not found");
    err.statusCode = 404;
    throw err;
  }

  if (!payment.customer.equals(userId) && userRole === "user") {
    const err = new Error("You can only refund your own payments");
    err.statusCode = 403;
    throw err;
  }

  if (payment.method !== "vnpay") {
    const err = new Error("Only VNPay payments can be refunded through this method");
    err.statusCode = 400;
    throw err;
  }

  if (payment.status !== "SUCCESS") {
    const err = new Error("Only successful payments can be refunded");
    err.statusCode = 400;
    throw err;
  }

  if (!payment.vnpTransactionNo) {
    const err = new Error("No VNPay transaction number found");
    err.statusCode = 400;
    throw err;
  }

  const amountUSD  = refundAmount ?? payment.amount;
  const amountVND  = Math.round(amountUSD * USD_TO_VND);
  const isPartial  = amountUSD < payment.amount;

  // Dùng thư viện vnpay để refund
  const result = await vnpay.refund({
    vnp_RequestId       : `RF${Date.now()}`,
    vnp_TxnRef          : payment.vnpTxnRef,
    vnp_Amount          : amountVND,
    vnp_OrderInfo       : `Hoan tien ${isPartial ? "mot phan" : "toan bo"} - ${payment.vnpTxnRef}`,
    vnp_TransactionNo   : payment.vnpTransactionNo,
    vnp_TransactionDate : payment.metadata?.vnpPayDate || new Date(payment.createdAt).toISOString(),
    vnp_CreateBy        : userId,
    vnp_IpAddr          : ipAddr,
    vnp_TransactionType : isPartial ? "03" : "02",
  });

  const refundSuccess = result.vnp_ResponseCode === "00";

  payment.metadata = {
    ...payment.metadata,
    refund: {
      amountUSD,
      amountVND,
      isPartial,
      responseCode: result.vnp_ResponseCode,
      message     : result.vnp_Message,
      refundedAt  : new Date().toISOString(),
    },
  };

  if (refundSuccess) {
    const bookingDoc = await Booking.findById(payment.booking?._id || payment.booking);
    if (bookingDoc) {
      bookingDoc.paymentStatus  = isPartial ? "Paid" : "Refunded";
      bookingDoc.refundedAmount = (bookingDoc.refundedAmount || 0) + amountUSD;
      if (!isPartial) bookingDoc.status = "Cancelled";
      await bookingDoc.save();
    }

    await Payment.create({
      booking      : payment.booking,
      bookings     : payment.bookings,
      customer     : userId,
      amount       : amountUSD,
      method       : "refund",
      status       : "SUCCESS",
      transactionId: `RF${Date.now()}`,
      metadata: {
        originalPaymentId: paymentId,
        vnpResponseCode  : result.vnp_ResponseCode,
        isPartial,
      },
    });
  }

  await payment.save();

  return {
    success     : refundSuccess,
    responseCode: result.vnp_ResponseCode,
    message     : result.vnp_Message,
    refundAmount: amountUSD,
    isPartial,
  };
};

export default {
  getClientIp,
  createVNPayOrder,
  handleVNPayReturn,
  handleVNPayIpn,
  refundVNPayPayment,
};