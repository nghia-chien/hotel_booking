import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiRequest } from "../api/client";
import { Button } from "../components/ui/button";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const orderId = params.get("token");
    const payerId = params.get("PayerID");
    if (!orderId || !payerId) {
      setError("Thiếu thông tin PayPal (token/PayerID).");
      setLoading(false);
      return;
    }

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        await apiRequest(
          "/api/payments/paypal/capture",
          "POST",
          { orderId, payerId },
          { auth: true }
        );
        setDone(true);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [params]);

  return (
    <div className="max-w-xl mx-auto bg-white border border-black/5 rounded-2xl p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-[#1F1F1F] mb-2">
        Thanh toán PayPal
      </h1>

      {loading && <p className="text-sm text-black/60">Đang xác nhận...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {done && (
        <p className="text-sm text-green-700">
          Thanh toán thành công. Booking đã được xác nhận.
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <Button
          className="bg-[#2C2C2C] hover:bg-black text-white rounded-xl"
          onClick={() => navigate("/my-bookings")}
        >
          Về Booking của tôi
        </Button>
        <Button
          variant="outline"
          className="rounded-xl border-[#E8DFD8] bg-white hover:bg-[#F5F1ED]"
          onClick={() => navigate("/rooms")}
        >
          Tiếp tục tìm phòng
        </Button>
      </div>
    </div>
  );
}

