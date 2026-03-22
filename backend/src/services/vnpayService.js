import crypto from "crypto";
import qs from "qs";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";

// ─── Config ───────────────────────────────────────────────────────────────────
const VNP_TMNCODE      = process.env.VNP_TMNCODE      || "YOUR_TMN_CODE";
const VNP_HASHSECRET   = process.env.VNP_HASHSECRET   || "YOUR_HASH_SECRET";
const VNP_URL          = process.env.VNP_URL           || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const VNP_RETURNURL    = process.env.VNP_RETURNURL     || "http://localhost:5173/payment/success";
const VNP_API_URL      = process.env.VNP_API_URL       || "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format Date → "YYYYMMDDHHmmss" (giờ VN) */
const formatDate = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  const d   = new Date(date);
  // Shift to GMT+7
  const vn  = new Date(d.getTime() + 7 * 60 * 60 * 1000);
  return (
    vn.getUTCFullYear().toString() +
    pad(vn.getUTCMonth() + 1) +
    pad(vn.getUTCDate()) +
    pad(vn.getUTCHours()) +
    pad(vn.getUTCMinutes()) +
    pad(vn.getUTCSeconds())
  );
};

/** Lấy IP từ request (dùng ở controller) */
export const getClientIp = (req) =>
  (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1")
    .split(",")[0]
    .trim();

/** Tạo HMAC-SHA512 checksum */
const createSecureHash = (params) => {
  // Sắp xếp key theo thứ tự alphabet, bỏ qua vnp_SecureHash
  const sorted = Object.keys(params)
    .filter((k) => k !== "vnp_SecureHash" && params[k] !== "" && params[k] !== null && params[k] !== undefined)
    .sort();

  const signData = sorted.map((k) => `${k}=${params[k]}`).join("&");
  return crypto
    .createHmac("sha512", VNP_HASHSECRET)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");
};

// ─── 1. Tạo URL thanh toán ────────────────────────────────────────────────────

/**
 * Tạo VNPay payment URL cho một hoặc nhiều booking.
 * @param {string|string[]} bookingIds
 * @param {string} userId
 * @param {string} ipAddr  - IP của khách (lấy từ request)
 * @returns {{ paymentUrl: string }}
 */
export const createVNPayOrder = async (bookingIds, userId, ipAddr) => {
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

  // Tổng tiền — VNPay nhận VNĐ, nhân 100 (đơn vị: đồng × 100)
  // Giả sử totalPrice trong DB là VNĐ. Nếu đang lưu USD thì nhân tỉ giá trước.
  const totalVND = bookings.reduce((sum, b) => sum + b.totalPrice, 0);

  // txnRef duy nhất, tối đa 100 ký tự
  const txnRef = `BK${Date.now()}`;
  const now    = new Date();

  // Tạo Payment record PENDING trước
  const payment = await Payment.create({
    booking  : ids[0],
    bookings : ids,
    customer : userId,
    amount   : totalVND,
    method   : "vnpay",
    status   : "PENDING",
    transactionId: txnRef,
    vnpTxnRef: txnRef,
    metadata : {
      bookingIds: ids,
      createTime: now.toISOString(),
    },
  });

  // Build VNPay params
  const params = {
    vnp_Version      : "2.1.0",
    vnp_Command      : "pay",
    vnp_TmnCode      : VNP_TMNCODE,
    vnp_Locale       : "vn",
    vnp_CurrCode     : "VND",
    vnp_TxnRef       : txnRef,
    vnp_OrderInfo    : `Thanh toan ${bookings.length} phong - ${txnRef}`,
    vnp_OrderType    : "other",
    vnp_Amount       : Math.round(totalVND * 100),   // VNPay yêu cầu × 100
    vnp_ReturnUrl    : VNP_RETURNURL,
    vnp_IpAddr       : ipAddr || "127.0.0.1",
    vnp_CreateDate   : formatDate(now),
  };

  params.vnp_SecureHash = createSecureHash(params);

  const paymentUrl = `${VNP_URL}?${qs.stringify(params, { encode: false })}`;

  return { paymentUrl, txnRef, paymentId: payment._id };
};

// ─── 2. Xử lý return URL (thay cho "capture") ────────────────────────────────

/**
 * Verify params VNPay gửi về returnUrl và cập nhật DB.
 * @param {object} vnpParams  - req.query từ VNPay redirect
 * @param {string} userId
 */
export const verifyVNPayReturn = async (vnpParams, userId) => {
  // Tách secure hash ra khỏi params để verify
  const receivedHash = vnpParams.vnp_SecureHash;
  const paramsToVerify = { ...vnpParams };
  delete paramsToVerify.vnp_SecureHash;
  delete paramsToVerify.vnp_SecureHashType;

  const computedHash = createSecureHash(paramsToVerify);

  if (computedHash !== receivedHash) {
    const err = new Error("Invalid payment signature");
    err.statusCode = 400;
    throw err;
  }

  const txnRef     = vnpParams.vnp_TxnRef;
  const responseCode = vnpParams.vnp_ResponseCode; // "00" = thành công
  const transactionNo = vnpParams.vnp_TransactionNo;

  // Tìm payment record
  const payment = await Payment.findOne({ vnpTxnRef: txnRef });
  if (!payment) {
    const err = new Error("Payment record not found");
    err.statusCode = 404;
    throw err;
  }

  // Verify ownership (userId có thể null nếu user chưa login lại sau redirect)
  if (userId && !payment.customer.equals(userId)) {
    const err = new Error("Unauthorized");
    err.statusCode = 403;
    throw err;
  }

  if (payment.status === "SUCCESS") {
    // Idempotent — đã xử lý rồi, trả về luôn
    const bookings = await Booking.find({ _id: { $in: payment.bookings?.length ? payment.bookings : [payment.booking] } });
    return { payment, bookings, alreadyProcessed: true };
  }

  const isSuccess = responseCode === "00";

  payment.status         = isSuccess ? "SUCCESS" : "FAILED";
  payment.vnpTransactionNo = transactionNo;
  payment.metadata       = {
    ...payment.metadata,
    vnpResponseCode: responseCode,
    vnpTransactionNo: transactionNo,
    vnpBankCode: vnpParams.vnp_BankCode,
    vnpCardType: vnpParams.vnp_CardType,
    vnpPayDate: vnpParams.vnp_PayDate,
    processedAt: new Date().toISOString(),
  };
  await payment.save();

  // Cập nhật booking
  const bookingIds = payment.bookings?.length ? payment.bookings : [payment.booking];
  const bookings   = await Booking.find({ _id: { $in: bookingIds } });

  if (isSuccess) {
    await Promise.all(
      bookings.map(async (b) => {
        if (b.status === "Pending") {
          b.status        = "Confirmed";
          b.paymentStatus = "Paid";
          await b.save();
        }
      })
    );
  }

  return { payment, bookings, success: isSuccess, responseCode };
};

// ─── 3. Hoàn tiền (refund) ────────────────────────────────────────────────────

/**
 * Gửi yêu cầu hoàn tiền qua VNPay API.
 * @param {string} paymentId   - _id của Payment record
 * @param {string} userId
 * @param {string} userRole
 * @param {number} [refundAmount]  - Số tiền hoàn (VNĐ). Nếu bỏ qua → hoàn toàn bộ.
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

  const amountToRefund = refundAmount ?? payment.amount;
  const isPartial      = amountToRefund < payment.amount;
  const transType      = isPartial ? "03" : "02"; // 02: full, 03: partial

  const txnRef   = payment.vnpTxnRef;
  const now      = new Date();
  const refundTxnRef = `RF${Date.now()}`;

  const params = {
    vnp_RequestId     : refundTxnRef,
    vnp_Version       : "2.1.0",
    vnp_Command       : "refund",
    vnp_TmnCode       : VNP_TMNCODE,
    vnp_TransactionType: transType,
    vnp_TxnRef        : txnRef,
    vnp_Amount        : Math.round(amountToRefund * 100),
    vnp_OrderInfo     : `Hoan tien ${isPartial ? "mot phan" : "toan bo"} - ${txnRef}`,
    vnp_TransactionNo : payment.vnpTransactionNo,
    vnp_TransactionDate: payment.metadata?.vnpPayDate || formatDate(payment.createdAt),
    vnp_CreateBy      : userId,
    vnp_CreateDate    : formatDate(now),
    vnp_IpAddr        : ipAddr || "127.0.0.1",
  };

  params.vnp_SecureHash = createSecureHash(params);

  // Gọi VNPay API
  const response = await fetch(VNP_API_URL, {
    method : "POST",
    headers: { "Content-Type": "application/json" },
    body   : JSON.stringify(params),
  });

  const result = await response.json();

  const refundSuccess = result.vnp_ResponseCode === "00";

  // Cập nhật Payment
  payment.metadata = {
    ...payment.metadata,
    refund: {
      txnRef       : refundTxnRef,
      amount       : amountToRefund,
      isPartial,
      responseCode : result.vnp_ResponseCode,
      message      : result.vnp_Message,
      refundedAt   : now.toISOString(),
    },
  };

  if (refundSuccess) {
    // Cập nhật Booking
    const bookingDoc = await Booking.findById(payment.booking?._id || payment.booking);
    if (bookingDoc) {
      bookingDoc.paymentStatus  = isPartial ? "Paid" : "Refunded"; // giữ Paid nếu hoàn 1 phần
      bookingDoc.refundedAmount = (bookingDoc.refundedAmount || 0) + amountToRefund;
      if (!isPartial) bookingDoc.status = "Cancelled";
      await bookingDoc.save();
    }

    // Tạo Payment record hoàn tiền riêng để audit
    await Payment.create({
      booking  : payment.booking,
      bookings : payment.bookings,
      customer : userId,
      amount   : amountToRefund,
      method   : "refund",
      status   : "SUCCESS",
      transactionId: refundTxnRef,
      metadata : {
        originalPaymentId: paymentId,
        vnpResponseCode  : result.vnp_ResponseCode,
        isPartial,
      },
    });
  }

  await payment.save();

  return {
    success: refundSuccess,
    responseCode: result.vnp_ResponseCode,
    message: result.vnp_Message,
    refundAmount: amountToRefund,
    isPartial,
    payment,
  };
};

export default {
  createVNPayOrder,
  verifyVNPayReturn,
  refundVNPayPayment,
  getClientIp,
};
