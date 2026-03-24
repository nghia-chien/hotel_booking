import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../api/client";
import { cn } from "../../components/ui/utils";
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Trash2,
  ChevronRight,
  ArrowRightLeft
} from "lucide-react";

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
      setMessage("Đã hoàn tất check-in.");
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
      setMessage("Đã hoàn tất check-out.");
      void loadBookings();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-[var(--color-border)]">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-2 block">
            Hệ thống quản trị
          </span>
          <h1 className="font-serif text-3xl font-bold text-[var(--color-text-primary)]">
            Quản lý Đặt phòng
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm mt-2">
            Theo dõi, phê duyệt và thực hiện quy trình Check-in/Check-out cho khách hàng.
          </p>
        </div>
      </header>

      {/* Notifications */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-center gap-3">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      {message && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bookings.map((b) => (
            <div
              key={b._id}
              className="group bg-white rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-[var(--color-border)] hover:border-gray-300 hover:shadow-[var(--shadow-md)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-text-primary)] transition-transform group-hover:scale-110">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-[var(--color-text-primary)]">
                      {new Date(b.checkIn).toLocaleDateString('vi-VN')}
                    </span>
                    <ArrowRightLeft className="w-3 h-3 text-[var(--color-text-muted)]" />
                    <span className="text-sm font-bold text-[var(--color-text-primary)]">
                      {new Date(b.checkOut).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)]">
                      <span className="text-[var(--color-text-muted)] italic">Mã đơn:</span>
                      <span className="font-mono">{b._id.substring(0, 8)}...</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                    <p className="text-sm font-bold text-[var(--color-text-primary)]">
                      {b.totalPrice.toLocaleString()} USD
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
                <StatusBadge status={b.status} />
                
                <div className="flex items-center gap-3">
                  {b.status === "Confirmed" && (
                    <button
                      onClick={() => handleCheckIn(b._id)}
                      className="px-5 py-2.5 bg-[var(--color-primary)] text-black text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm hover:opacity-90 transition-all flex items-center gap-2"
                    >
                      Check-in
                    </button>
                  )}
                  {b.status === "CheckedIn" && (
                    <button
                      onClick={() => handleCheckOut(b._id)}
                      className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm hover:bg-emerald-700 transition-all flex items-center gap-2"
                    >
                      Check-out
                    </button>
                  )}
                  <Link 
                    to={`/admin/bookings?id=${b._id}`}
                    className="p-2.5 bg-[var(--color-surface)] hover:bg-gray-200 text-[var(--color-text-primary)] rounded-xl transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {!loading && bookings.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-[var(--color-border)]">
              <Clock className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-4" />
              <p className="text-[var(--color-text-secondary)] font-medium">Chưa có booking nào trong danh sách.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { bg: string; text: string; label: string }> = {
    Confirmed: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Đã xác nhận" },
    Pending: { bg: "bg-amber-50", text: "text-amber-700", label: "Chờ duyệt" },
    Cancelled: { bg: "bg-red-50", text: "text-red-700", label: "Đã hủy" },
    CheckedIn: { bg: "bg-blue-50", text: "text-blue-700", label: "Đã nhận phòng" },
    CheckedOut: { bg: "bg-gray-50", text: "text-gray-700", label: "Đã trả phòng" },
  };

  const config = configs[status] || { bg: "bg-gray-50", text: "text-gray-700", label: status };

  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-transparent",
      config.bg,
      config.text
    )}>
      {config.label}
    </span>
  );
}

export default AdminBookingsPage;