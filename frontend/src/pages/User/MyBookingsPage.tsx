import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiRequest } from "../../api/client";
import { useErrorHandler } from "../../utils/errorHandling";

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
  const { t, i18n } = useTranslation();
  const { getErrorMessage } = useErrorHandler();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const dateLocale = i18n.language === "vi" ? "vi-VN" : "en-US";

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
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBookings();
  }, []);

  const handleCancel = async (id: string) => {
    if (!window.confirm(t('myBookings.confirmCancel'))) return;

    setError(null);
    setMessage(null);
    try {
      await apiRequest(`/api/bookings/${id}/cancel`, "POST", null, {
        auth: true
      });
      setMessage(t('myBookings.cancelSuccess'));
      void loadBookings();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t('myBookings.pageTitle')}</h1>

      {loading && <p className="text-gray-500">{t('common.loading')}</p>}
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
                {new Date(b.checkIn).toLocaleDateString(dateLocale)} -{" "}
                {new Date(b.checkOut).toLocaleDateString(dateLocale)}
              </p>
              <p className="text-sm text-gray-600">
                {t('myBookings.statusLabel')}: {t(`status.${b.status}`, b.status)}
              </p>
              <p className="text-sm">
                {t('myBookings.totalLabel')}:{" "}
                <span className="font-semibold">
                  {b.totalPrice.toLocaleString()} $
                </span>
              </p>
            </div>

            <div className="flex flex-col gap-2 items-end">
              {(b.status === "Pending" || b.status === "Paid") && (
                <button
                  onClick={() => handleCancel(b._id)}
                  className="text-sm bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors"
                >
                  {t('myBookings.cancelButton')}
                </button>
              )}
            </div>
          </div>
        ))}

        {!loading && bookings.length === 0 && (
          <p className="text-gray-600 italic">
            {t('myBookings.emptyState')}
          </p>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;