import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { useLocation } from "react-router-dom";

interface Booking {
  _id: string;
  status: string;
  paymentStatus: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
}

interface BookingsResponse {
  success: boolean;
  data: Booking[];
}

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const location = useLocation() as { state?: { message?: string } };

  const loadBookings = async () => {
    setError(null);
    setSelectedIds([]);
    setMessage(null);
    setLoading(true);
    try {
      const res = await apiRequest<BookingsResponse>(
        "/api/bookings/me",
        "GET",
        undefined,
        { auth: true }
      );
      setBookings(res.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBookings();
  }, []);

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = async (id: string) => {
    setError(null);
    setMessage(null);
    try {
      await apiRequest(`/api/bookings/${id}/cancel`, "POST", null, {
        auth: true
      });
      setMessage("Booking cancelled");
      void loadBookings();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const eligibleForPay = (b: Booking) =>
    b.status === "Pending" && b.paymentStatus === "Pending";

  const toggleSelected = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) return Array.from(new Set([...prev, id]));
      return prev.filter((x) => x !== id);
    });
  };

  const handlePayPal = async (bookingIds: string[]) => {
    setError(null);
    setMessage(null);
    setPayLoading(true);
    try {
      const resp = await apiRequest<{
        success: boolean;
        data: { orderId: string; approvalUrl: string };
      }>(
        "/api/payments/paypal/create-order",
        "POST",
        { bookingIds },
        { auth: true }
      );
      window.location.href = resp.data.approvalUrl;
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Booking của tôi</h1>
      {loading && <p>Đang tải...</p>}
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {message && <p className="text-green-600 mb-2">{message}</p>}

      <div className="space-y-3">
        {bookings.map((b) => (
          <div
            key={b._id}
            className="border border-gray-100 bg-white rounded-2xl p-4 flex justify-between shadow-sm"
          >
            <div>
              {eligibleForPay(b) && (
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(b._id)}
                    onChange={(e) => toggleSelected(b._id, e.target.checked)}
                  />
                  <span className="text-sm text-black/60">
                    Chưa thanh toán
                  </span>
                </div>
              )}
              <p className="font-semibold">
                {new Date(b.checkIn).toLocaleDateString()} -{" "}
                {new Date(b.checkOut).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                Trạng thái: {b.status} · Thanh toán: {b.paymentStatus}
              </p>
              <p className="text-sm">
                Tổng tiền:{" "}
                <span className="font-semibold">
                  {b.totalPrice.toFixed(2)} $
                </span>
              </p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              {(b.status === "Pending" || b.status === "Confirmed") && (
                <button
                  onClick={() => handleCancel(b._id)}
                  className="text-sm bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition"
                >
                  Huỷ booking
                </button>
              )}
            </div>
          </div>
        ))}

        {!loading && bookings.length === 0 && (
          <p className="text-gray-600">
            Bạn chưa có booking nào. Hãy đặt phòng tại trang Rooms.
          </p>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            className="text-sm bg-gray-200 px-3 py-1 rounded-lg hover:bg-gray-300 transition disabled:opacity-60"
            disabled={payLoading}
            onClick={() => setSelectedIds([])}
          >
            Bỏ chọn
          </button>
          <button
            className="text-sm bg-[#2C2C2C] text-white px-4 py-2 rounded-lg hover:bg-black transition disabled:opacity-60"
            disabled={payLoading}
            onClick={() => handlePayPal(selectedIds)}
          >
            {payLoading ? "Đang chuyển PayPal..." : `Thanh toán ${selectedIds.length} phòng`}
          </button>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;

