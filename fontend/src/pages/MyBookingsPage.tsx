import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const location = useLocation() as { state?: { message?: string } };
  const navigate = useNavigate();

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
      setMessage(t('myBookings.cancelSuccess'));
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

  const handlePayVNPay = async (bookingIds: string[]) => {
    setError(null);
    setMessage(null);
    setPayLoading(true);
    try {
      const resp = await apiRequest<{
        success: boolean;
        data: { paymentUrl: string; txnRef: string };
      }>(
        "/api/payments/vnpay/create-order",
        "POST",
        { bookingIds },
        { auth: true }
      );

      if (resp.success && resp.data.paymentUrl) {
        window.location.assign(resp.data.paymentUrl);
      } else {
        throw new Error("Can not get URL payment");
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e.response?.data?.message || e.message || "Error in MyBookings handlePayVNPay");
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t('myBookings.title')}</h1>
      {loading && <p>{t('myBookings.loading')}</p>}
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {message && <p className="text-green-600 mb-2">{message}</p>}

      <div className="space-y-3">
        {bookings.map((b) => (
          <div key={b._id} onClick={() => navigate(`/my-bookings/${b._id}`)} className="border border-gray-100 bg-white rounded-2xl p-4 flex justify-between shadow-sm hover:border-blue-400 transition cursor-pointer group">
            <div>
              {eligibleForPay(b) && (
                <div className="flex items-center gap-2 mb-2" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={selectedIds.includes(b._id)} onChange={(e) => toggleSelected(b._id, e.target.checked)} />
                  <span className="text-sm text-black/60">{t('myBookings.unpaid')}</span>
                </div>
              )}
              <p className="font-semibold">
                {new Date(b.checkIn).toLocaleDateString()} – {new Date(b.checkOut).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">{t('myBookings.status', { status: b.status, payment: b.paymentStatus })}</p>
              <p className="text-sm">{t('myBookings.total')} <span className="font-semibold">{b.totalPrice.toLocaleString("vi-VN")} $</span></p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              {eligibleForPay(b) && (
                <button onClick={(e) => { e.stopPropagation(); handlePayVNPay([b._id]); }} disabled={payLoading} className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition disabled:opacity-60">
                  {t('myBookings.pay')}
                </button>
              )}
              {(b.status === "Pending" || b.status === "Confirmed") && (
                <button onClick={(e) => { e.stopPropagation(); handleCancel(b._id); }} className="text-sm bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition">
                  {t('myBookings.cancel')}
                </button>
              )}
            </div>
          </div>
        ))}
        {!loading && bookings.length === 0 && <p className="text-gray-600">{t('myBookings.noBookings')}</p>}
      </div>

      {selectedIds.length > 0 && (
        <div className="mt-4 flex items-center justify-end gap-3">
          <button className="text-sm bg-gray-200 px-3 py-1 rounded-lg hover:bg-gray-300 transition disabled:opacity-60" disabled={payLoading} onClick={() => setSelectedIds([])}>
            {t('myBookings.deselect')}
          </button>
          <button className="text-sm bg-[#2C2C2C] text-white px-4 py-2 rounded-lg hover:bg-black transition disabled:opacity-60" disabled={payLoading} onClick={() => handlePayVNPay(selectedIds)}>
            {payLoading ? t('myBookings.paying') : t('myBookings.paySelected', { count: selectedIds.length })}
          </button>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;