import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { cn } from "../components/ui/utils";
import BookingSummaryCard from "../components/BookingSummaryCard";
import { usePaymentFeature } from "../features/payment/hooks";

const StatusBadge = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  const getStatusColor = (s: string) => {
    switch (s) {
      case 'SUCCESS': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'FAILED': return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'REFUNDED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };
  return (
    <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap border", getStatusColor(status))}>
      {t(`payments.status.${status}`, status)}
    </span>
  );
};

export default function PaymentHistoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { payments, loading, fetchMyPayments, createVNPayOrder } = usePaymentFeature();
  const [payLoadingId, setPayLoadingId] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    void fetchMyPayments();
  }, [fetchMyPayments]);

  const filtered = useMemo(() => {
    let result = [...payments];
    if (statusFilter !== "ALL") {
      result = result.filter(p => p.status === statusFilter);
    }
    if (startDate) {
      result = result.filter(p => new Date(p.createdAt) >= new Date(startDate));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59);
      result = result.filter(p => new Date(p.createdAt) <= end);
    }
    return result;
  }, [statusFilter, startDate, endDate, payments]);

  const handlePayAgain = async (paymentId: string, bookingIds: string[]) => {
    if (bookingIds.length === 0) return;
    setPayLoadingId(paymentId);
    try {
      const paymentUrl = await createVNPayOrder(bookingIds);
      window.location.assign(paymentUrl);
    } catch (err) {
      setPayLoadingId(null);
    }
  };

  const pendingCount = payments.filter(p => p.status === "PENDING").length;

  if (loading && payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-gray-500">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-tighter">{t('payments.filter.statusLabel')}</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 border-gray-300 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
          >
            <option value="ALL">{t('payments.filterAll')}</option>
            <option value="SUCCESS">{t('payments.status.SUCCESS')}</option>
            <option value="PENDING">{t('payments.status.PENDING')}</option>
            <option value="FAILED">{t('payments.status.FAILED')}</option>
            <option value="REFUNDED">{t('payments.status.REFUNDED')}</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-tighter">{t('payments.filter.startDate')}</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full h-10 border-gray-300 rounded-xl bg-gray-50 text-sm px-3 focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-tighter">{t('payments.filter.endDate')}</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full h-10 border-gray-300 rounded-xl bg-gray-50 text-sm px-3 focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="space-y-6">
        {pendingCount > 0 && (
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start sm:items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-full hidden sm:block">
              <svg className="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-amber-800">Bạn có {pendingCount} giao dịch chưa hoàn tất</p>
              <p className="text-sm text-amber-700 mt-1">Đừng lo lắng, bạn có thể thực hiện thanh toán lại ngay bên dưới. Các giao dịch này sẽ tự động hủy nếu quá hạn.</p>
            </div>
          </div>
        )}

        {filtered.map(payment => {
          const bks = payment.bookings?.length ? payment.bookings : (payment.booking ? [payment.booking] : []);
          const paymentId = (payment as any)._id || payment.id || '';
          return (
            <div key={paymentId} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-gray-50/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Giao dịch <span className="text-gray-900 font-mono">#{payment.transactionId || (payment as any).txnRef || paymentId}</span></p>
                  <p className="text-xs text-gray-400 mt-0.5">{format(new Date(payment.createdAt), "HH:mm - dd/MM/yyyy")}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-0.5">{payment.method || 'VNPAY'}</p>
                    <p className="text-lg font-bold text-gray-900">${payment.amount.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <StatusBadge status={payment.status} />
                    {payment.status === "PENDING" && (
                      <button 
                        onClick={() => handlePayAgain(paymentId, bks.map(b => b._id || b.id))}
                        disabled={payLoadingId === paymentId}
                        className="text-[11px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-3 py-1.5 rounded hover:bg-emerald-700 transition"
                      >
                        {payLoadingId === paymentId ? "Đang xử lý..." : "Thanh toán lại"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {bks.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Không có dữ liệu phòng</p>
                ) : (
                  bks.map((b) => (
                    <BookingSummaryCard
                      key={b._id || b.id}
                      mode="bill"
                      data={{
                        _id: b._id || b.id,
                        roomNumber: b.room?.roomNumber || "N/A",
                        roomTypeName: b.roomType?.name || (b.room?.roomType?.name) || "Phòng",
                        image: b.room?.images?.[0],
                        checkIn: b.checkIn,
                        checkOut: b.checkOut,
                        guests: b.guests,
                        capacity: b.room?.capacity || b.guests,
                        totalPrice: b.totalPrice,
                        status: b.status
                      }}
                      onClick={(id) => navigate(`/my-bookings/${id}`)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}

        {!loading && filtered.length === 0 && (
          <div className="p-12 text-center space-y-4 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="p-4 bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto opacity-50">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="text-gray-900 font-bold">{t('payments.empty.title')}</p>
              <p className="text-gray-400 text-sm">{t('payments.empty.subtitle')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}