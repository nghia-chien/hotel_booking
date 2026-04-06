import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from '../../node_modules/react-i18next';


const VNP_MESSAGES: Record<string, string> = {
  "00": "Giao dịch thành công",
  "07": "Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
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

// Route get redirect from backend:
//   /payment/result?status=success
//   /payment/result?status=failed&code=24
// Backend verify hash and update DB 
export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const status = searchParams.get("status");   // "success" | "failed"
  const code = searchParams.get("code") ?? "99";

  const isSuccess = status === "success";
  const message = isSuccess
    ? VNP_MESSAGES["00"]
    : (VNP_MESSAGES[code] ?? VNP_MESSAGES["99"]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">

        {isSuccess ? (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('payments.success')}</h1>
            <p className="text-gray-500 mb-6">{message}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate("/my-bookings")} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                {t('myBookings.title')}
              </button>
              <button onClick={() => navigate("/")} className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition">
                {t('notFound.back')}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {code === "24" ? t('payments.cancel') : t('common.error')}
            </h1>
            <p className="text-gray-500 mb-6">{message}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition">
                {t('common.retry')}
              </button>
              <button onClick={() => navigate("/")} className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition">
                {t('notFound.back')}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}