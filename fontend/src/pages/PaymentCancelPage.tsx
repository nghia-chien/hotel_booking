import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

export default function PaymentCancelPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-xl mx-auto bg-white border border-black/5 rounded-2xl p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-[#1F1F1F] mb-2">
        Đã huỷ thanh toán
      </h1>
      <p className="text-sm text-black/60">
        Bạn đã huỷ giao dịch PayPal. Bạn có thể thử thanh toán lại trong danh
        sách booking.
      </p>

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

