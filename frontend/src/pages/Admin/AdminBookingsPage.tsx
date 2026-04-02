import { useTranslation } from "../../../node_modules/react-i18next";
import { checkInBooking, checkOutBooking, cancelBooking } from "../../api/admin.api";
import { useAdminData } from "../../hooks/useAdminData";
import { 
  Calendar, 
  Clock, 
  ArrowRightLeft,
  User,
  Phone,
  DoorOpen
} from "lucide-react";
import { StatusBadge, AdminPageHeader, AlertMessage } from "../../components/admin";

interface Booking {
  _id: string;
  status: string;
  paymentStatus: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  customer?: {
    fullName: string;
    email: string;
    phone: string;
  };
  room?: {
    roomNumber: string;
  };
}

const AdminBookingsPage = () => {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === "vi" ? "vi-VN" : "en-US";

  const {
    data: bookingsData,
    loading,
    error,
    success: message,
    setError,
    setSuccess: setMessage,
    reload: loadBookings,
  } = useAdminData<Booking[]>({ path: "/api/bookings" });
  const bookings = bookingsData ?? [];

  const handleCheckIn = async (id: string) => {
    setError(null);
    setMessage(null);
    try {
      await checkInBooking(id);
      setMessage(t('admin.bookings.messages.checkInSuccess'));
      void loadBookings();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleCheckOut = async (id: string) => {
    setError(null);
    setMessage(null);
    try {
      await checkOutBooking(id);
      setMessage(t('admin.bookings.messages.checkOutSuccess'));
      void loadBookings();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm(t('admin.bookings.messages.confirmCancel'))) return;
    setError(null);
    setMessage(null);
    try {
      await cancelBooking(id);
      setMessage(t('admin.bookings.messages.cancelSuccess'));
      void loadBookings();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <AdminPageHeader
        eyebrow={t('admin.bookings.eyebrow')}
        title={t('admin.bookings.title')}
        subtitle={t('admin.bookings.subtitle')}
      />

      {/* Notifications */}
      <AlertMessage type="error" message={error || ""} />
      <AlertMessage type="success" message={message || ""} />

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bookings.map((b) => (
            <div
              key={b._id}
              className="group bg-white rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-[var(--color-border)] hover:border-gray-300 hover:shadow-[var(--shadow-md)] transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-6"
            >
              <div className="flex flex-col md:flex-row items-start gap-6 flex-1">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-text-primary)] flex-shrink-0 transition-transform group-hover:scale-110">
                  <Calendar className="w-6 h-6" />
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                   <div>
                     <div className="flex items-center gap-2 mb-1.5">
                       <span className="text-sm font-bold text-[var(--color-text-primary)]">
                         {new Date(b.checkIn).toLocaleDateString(dateLocale)}
                       </span>
                       <ArrowRightLeft className="w-3 h-3 text-[var(--color-text-muted)]" />
                       <span className="text-sm font-bold text-[var(--color-text-primary)]">
                         {new Date(b.checkOut).toLocaleDateString(dateLocale)}
                       </span>
                     </div>
                     <div className="flex items-center gap-2 mt-2 font-mono text-xs text-[var(--color-text-secondary)]">
                        <span className="bg-gray-100 px-2 py-0.5 rounded-md">#{b._id.substring(0, 8)}</span>
                        <span className="font-sans font-bold text-[var(--color-text-primary)] ml-2">
                          {t('admin.bookings.priceFormat', { price: b.totalPrice.toLocaleString() })}
                        </span>
                     </div>
                     <div className="mt-3 flex gap-2 items-center text-xs">
                        <StatusBadge status={b.status} />
                        {b.paymentStatus === "Paid" && <span className="px-2 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700 font-bold uppercase tracking-wider">{t('admin.bookings.status.paid')}</span>}
                        {b.paymentStatus === "Refunded" && <span className="px-2 py-0.5 rounded border border-orange-200 bg-orange-50 text-orange-700 font-bold uppercase tracking-wider">{t('admin.bookings.status.refunded')}</span>}
                     </div>
                   </div>

                   <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 space-y-2">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2 text-sm">
                           <User className="w-4 h-4 text-gray-400" />
                           <span className="font-bold text-gray-900">{b.customer?.fullName || t('admin.bookings.anonymousGuest')}</span>
                         </div>
                         <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                           <DoorOpen className="w-3.5 h-3.5" />
                           <span className="font-black">{t('admin.bookings.roomNumber', { number: b.room?.roomNumber || "N/A" })}</span>
                         </div>
                      </div>
                      {b.customer?.phone && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{b.customer.phone}</span>
                        </div>
                      )}
                      {b.customer?.email && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 truncate">
                          <span className="w-3.5 h-3.5 flex items-center justify-center font-bold">@</span>
                          <span className="truncate">{b.customer.email}</span>
                        </div>
                      )}
                   </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 border-t xl:border-t-0 pt-4 xl:pt-0">
                {(b.status === "Pending" || b.status === "Confirmed") && (
                  <button
                    onClick={() => handleCancel(b._id)}
                    className="px-4 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                  >
                    {t('admin.bookings.actions.cancel')}
                  </button>
                )}
                {b.status === "Confirmed" && (
                  <button
                    onClick={() => handleCheckIn(b._id)}
                    className="px-5 py-2.5 bg-[var(--color-primary)] text-[var(--color-text-primary)] text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm hover:opacity-90 transition-all flex items-center gap-2"
                  >
                    {t('admin.bookings.actions.checkIn')}
                  </button>
                )}
                {b.status === "CheckedIn" && (
                  <button
                    onClick={() => handleCheckOut(b._id)}
                    className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm hover:bg-emerald-700 transition-all flex items-center gap-2"
                  >
                    {t('admin.bookings.actions.checkOut')}
                  </button>
                )}
              </div>
            </div>
          ))}

          {!loading && bookings.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-[var(--color-border)]">
              <Clock className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-4" />
              <p className="text-[var(--color-text-secondary)] font-medium">{t('admin.bookings.emptyList')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage;