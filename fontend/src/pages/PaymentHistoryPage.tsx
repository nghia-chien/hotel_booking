import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";
import { 
  CreditCard, 
  Search, 
  Calendar as CalendarIcon,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCcw,
  ArrowUpDown
} from "lucide-react";
import { format } from "date-fns";

interface Room {
  roomNumber: string;
}

interface RoomType {
  name: string;
}

interface Booking {
  _id: string;
  room: Room;
  roomType: RoomType;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: string;
}

interface Payment {
  _id: string;
  transactionId: string;
  amount: number;
  method: string;
  status: "SUCCESS" | "FAILED" | "PENDING" | "REFUNDED";
  booking?: Booking;
  bookings?: Booking[];
  createdAt: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  const configs: Record<string, { color: string; icon: any; label: string }> = {
    SUCCESS: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2, label: "Thành công" },
    FAILED: { color: "bg-red-100 text-red-700", icon: XCircle, label: "Thất bại" },
    PENDING: { color: "bg-gray-100 text-gray-700", icon: Clock, label: "Đang xử lý" },
    REFUNDED: { color: "bg-yellow-100 text-yellow-700", icon: RefreshCcw, label: "Đã hoàn tiền" },
  };

  const config = configs[status] || { color: "bg-gray-100 text-gray-700", icon: Clock, label: status };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

export default function PaymentHistoryPage() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const loadPayments = async () => {
    try {
      const res = await apiRequest<{ success: boolean; data: Payment[] }>(
        "/api/payments/my",
        "GET",
        undefined,
        { auth: true }
      );
      setPayments(res.data);
      setFilteredPayments(res.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPayments();
  }, []);

  useEffect(() => {
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

    setFilteredPayments(result);
  }, [statusFilter, startDate, endDate, payments]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-gray-500">Đang tải lịch sử thanh toán...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch sử thanh toán</h1>
          <p className="text-gray-500 text-sm">Quản lý và tra cứu các giao dịch của bạn tại đây.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-tighter">Trạng thái</label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 border-gray-200 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="SUCCESS">Thành công</option>
            <option value="FAILED">Thất bại</option>
            <option value="REFUNDED">Hoàn tiền</option>
            <option value="PENDING">Chờ xử lý</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-tighter">Từ ngày</label>
          <input 
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full h-10 border-gray-200 rounded-xl bg-gray-50 text-sm px-3 focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-tighter">Đến ngày</label>
          <input 
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full h-10 border-gray-200 rounded-xl bg-gray-50 text-sm px-3 focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">Mã giao dịch</th>
                <th className="px-6 py-4">Sản phẩm / Kỳ hạn</th>
                <th className="px-6 py-4 text-right">Số tiền</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">Ngày thực hiện</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPayments.map((p) => {
                const booking = p.booking || p.bookings?.[0];
                const roomInfo = booking?.roomType?.name || (booking?.room?.roomNumber ? `Phòng ${booking.room.roomNumber}` : "N/A");
                const bookingId = booking?._id;

                return (
                  <tr 
                    key={p._id}
                    onClick={() => bookingId && navigate(`/my-bookings/${bookingId}`)}
                    className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-gray-400 group-hover:text-blue-600">
                      {p.transactionId || p._id.toString().substring(0, 10).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 group-hover:text-blue-700">{roomInfo}</span>
                        {booking && (
                          <span className="text-xs text-gray-500">
                            {format(new Date(booking.checkIn), "dd/MM")} - {format(new Date(booking.checkOut), "dd/MM")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-gray-900">{p.amount.toLocaleString()} ₫</span>
                      <p className="text-[10px] text-gray-300 uppercase font-black">{p.method}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      {format(new Date(p.createdAt), "dd/MM/yyyy")}
                      <div className="text-[10px] text-gray-400">{format(new Date(p.createdAt), "HH:mm")}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && filteredPayments.length === 0 && (
          <div className="p-12 text-center space-y-4">
            <div className="p-4 bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto opacity-50">
              <CreditCard className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="text-gray-900 font-bold">Không tìm thấy giao dịch nào</p>
              <p className="text-gray-400 text-sm">Thử điều chỉnh bộ lọc để tìm kiếm kết quả khác.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
