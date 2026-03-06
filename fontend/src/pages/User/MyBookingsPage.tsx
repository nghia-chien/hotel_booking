import { useEffect, useState } from "react";
import { apiRequest } from "../../api/client";

interface Booking {
  _id: string;
  status: string;
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

  const loadBookings = async () => {
    setError(null);
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

  const handlePay = async (id: string) => {
    setError(null);
    setMessage(null);
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
              <p className="font-semibold">
                {new Date(b.checkIn).toLocaleDateString()} -{" "}
                {new Date(b.checkOut).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                Trạng thái: {b.status}
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

      };
};

export default MyBookingsPage;

