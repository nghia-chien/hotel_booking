import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {apiRequest} from "../api/client";

type Status = "verifying" | "success" | "failed" | "invalid";

interface VerifyResult {
  success: boolean;
  responseCode: string;
  bookings?: { _id: string; status: string; paymentStatus: string }[];
}

// Map mã lỗi VNPay → thông báo tiếng Việt
const VNP_MESSAGES: Record<string, string> = {
  "00": "Giao dịch thành công",
  "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
  "09": "Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking.",
  "10": "Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.",
  "11": "Đã hết hạn chờ thanh toán. Vui lòng thực hiện lại giao dịch.",
  "12": "Thẻ/Tài khoản bị khoá.",
  "13": "Nhập sai mật khẩu OTP. Vui lòng thực hiện lại giao dịch.",
  "24": "Giao dịch bị huỷ.",
  "51": "Tài khoản không đủ số dư để thực hiện giao dịch.",
  "65": "Tài khoản đã vượt quá hạn mức giao dịch trong ngày.",
  "75": "Ngân hàng thanh toán đang bảo trì.",
  "79": "Nhập sai mật khẩu thanh toán quá số lần quy định.",
  "99": "Lỗi không xác định.",
};

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const calledRef      = useRef(false); // tránh gọi 2 lần (React StrictMode)

  const [status, setStatus]   = useState<Status>("verifying");
  const [message, setMessage] = useState("");
  const [bookingCount, setBookingCount] = useState(0);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const verifyPayment = async () => {
      // Lấy toàn bộ query params VNPay gửi về
      const vnpParams: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        vnpParams[key] = value;
      });

      // Kiểm tra có phải từ VNPay không
      if (!vnpParams.vnp_TxnRef || !vnpParams.vnp_SecureHash) {
        setStatus("invalid");
        setMessage("Không tìm thấy thông tin giao dịch.");
        return;
      }

      try {
        const res = await apiRequest<{ success: boolean; data: VerifyResult }>(
          "/payments/vnpay/verify-return","POST",
          vnpParams
        );

        const { data } = res;
        const responseCode = data.responseCode ?? vnpParams.vnp_ResponseCode;

        if (data.success && responseCode === "00") {
          setStatus("success");
          setMessage(VNP_MESSAGES["00"]);
          setBookingCount(data.bookings?.length ?? 0);
        } else {
          setStatus("failed");
          setMessage(VNP_MESSAGES[responseCode] ?? VNP_MESSAGES["99"]);
        }
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          "Có lỗi xảy ra khi xác nhận thanh toán.";
        setStatus("failed");
        setMessage(msg);
      }
    };

    verifyPayment();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        {status === "verifying" && (
          <>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h1 className="text-xl font-semibold text-gray-700">Đang xác nhận thanh toán…</h1>
            <p className="text-gray-400 mt-2 text-sm">Vui lòng không đóng trang này.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h1>
            <p className="text-gray-500 mb-1">{message}</p>
            {bookingCount > 0 && (
              <p className="text-sm text-gray-400 mb-6">
                {bookingCount} đặt phòng đã được xác nhận.
              </p>
            )}
            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={() => navigate("/my-bookings")}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Xem đặt phòng
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Về trang chủ
              </button>
            </div>
          </>
        )}

        {(status === "failed" || status === "invalid") && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {status === "invalid" ? "Giao dịch không hợp lệ" : "Thanh toán thất bại"}
            </h1>
            <p className="text-gray-500 mb-6">{message}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
              >
                Thử lại
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Về trang chủ
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
