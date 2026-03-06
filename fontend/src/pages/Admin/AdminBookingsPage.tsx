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

const AdminBookingsPage = () => {
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
        "/api/bookings",
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

  const handleCheckIn = async (id: string) => {
    setError(null);
    setMessage(null);
    try {
      await apiRequest(`/api/bookings/${id}/check-in`, "POST", null, {
        auth: true
      });
      setMessage("Checked in");
      void loadBookings();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleCheckOut = async (id: string) => {
    setError(null);
    setMessage(null);
    try {
      await apiRequest(`/api/bookings/${id}/check-out`, "POST", null, {
        auth: true
      });
      setMessage("Checked out");
      void loadBookings();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin · Quản lý booking</h1>
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
              {b.status === "Confirmed" && (
                <button
                  onClick={() => handleCheckIn(b._id)}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg"
                >
                  Check-in
                </button>
              )}
              {b.status === "CheckedIn" && (
                <button
                  onClick={() => handleCheckOut(b._id)}
                  className="text-sm bg-green-600 text-white px-3 py-1 rounded-lg"
                >
                  Check-out
                </button>
              )}
            </div>
          </div>
        ))}

        {!loading && bookings.length === 0 && (
          <p className="text-gray-600">Chưa có booking nào.</p>
        )}
      </div>
    </div>
  );
};

export default AdminBookingsPage;