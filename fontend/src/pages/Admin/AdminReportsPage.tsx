import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../api/client";
import { cn } from "../../components/ui/utils";
import { 
  BarChart3, 
  PieChart, 
  Calendar, 
  TrendingUp, 
  Users, 
  Hotel,

  Search,
  AlertCircle
} from "lucide-react";
import { AdminPageHeader, AlertMessage } from "../../components/admin";

interface OccupancyResponse {
  success: boolean;
  data: {
    occupancyRate: number;
    totalRooms: number;
    occupiedRooms?: number;
  };
}

interface PopularItem {
  _id: string;
  bookings: number;
}

interface PopularResponse {
  success: boolean;
  data: PopularItem[];
}

interface RoomTypeItem {
  _id: string;
  name: string;
}

interface RoomTypeListResponse {
  success: boolean;
  data: RoomTypeItem[];
}

const toISODate = (d: Date) => d.toISOString().slice(0, 10);

export default function AdminReportsPage() {
  const [startDate, setStartDate] = useState(() => toISODate(new Date()));
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return toISODate(d);
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [occupancy, setOccupancy] = useState<OccupancyResponse["data"] | null>(
    null
  );
  const [popular, setPopular] = useState<PopularItem[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeItem[]>([]);

  const roomTypeNameById = useMemo(() => {
    const m = new Map<string, string>();
    roomTypes.forEach((rt) => m.set(rt._id, rt.name));
    return m;
  }, [roomTypes]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [occRes, popRes, rtRes] = await Promise.all([
        apiRequest<OccupancyResponse>(
          `/api/bookings/reports/occupancy?${new URLSearchParams({
            startDate,
            endDate
          }).toString()}`,
          "GET",
          undefined,
          { auth: true }
        ),
        apiRequest<PopularResponse>(
          "/api/bookings/reports/popular-room-types",
          "GET",
          undefined,
          { auth: true }
        ),
        apiRequest<RoomTypeListResponse>(
          "/api/room-types",
          "GET",
          undefined,
          { auth: true }
        )
      ]);

      setOccupancy(occRes.data);
      setPopular(popRes.data);
      setRoomTypes(rtRes.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-6 animate-in fade-in duration-500">
      {/* Header */}
      <AdminPageHeader
        eyebrow="Phân tích số liệu"
        title="Báo cáo & Thống kê"
        subtitle="Theo dõi hiệu suất lấp đầy phòng và các danh mục dịch vụ phổ biến nhất."
      />

      {/* Filter Section */}
      <section className="bg-white rounded-3xl p-8 shadow-[var(--shadow-sm)] border border-[var(--color-border)]">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-5 h-5 text-[var(--color-text-muted)]" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)]">Khoảng thời gian báo cáo</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Từ ngày</label>
            <input
              type="date"
              className="w-full bg-[var(--color-surface)] border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Đến ngày</label>
            <input
              type="date"
              className="w-full bg-[var(--color-surface)] border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button
            className="h-[48px] bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-sm hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            onClick={load}
            disabled={loading}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Search className="w-4 h-4" />
            )}
            Xem báo cáo
          </button>
        </div>

        <AlertMessage type="error" message={error || ""} className="mt-6" />
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Occupancy Rate Card */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-8 shadow-[var(--shadow-sm)] border border-[var(--color-border)] flex flex-col justify-between overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
              <PieChart className="w-32 h-32" />
           </div>
           
           <div>
             <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">Occupancy Rate</h3>
             <p className="text-xs text-[var(--color-text-muted)] font-medium mb-8 italic">Hiệu suất lấp đầy phòng</p>
             
             {occupancy ? (
               <div className="space-y-8">
                 <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black text-[var(--color-text-primary)] tracking-tighter">
                      {occupancy.occupancyRate.toFixed(1)}
                    </span>
                    <span className="text-3xl font-bold text-[var(--color-primary-dark)]">%</span>
                 </div>
                 
                 <div className="space-y-3">
                   <div className="w-full h-3 bg-[var(--color-surface)] rounded-full overflow-hidden border border-[var(--color-border)]">
                      <div 
                        className="h-full bg-[var(--color-primary)] transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(200,240,0,0.5)]"
                        style={{ width: `${occupancy.occupancyRate}%` }}
                      ></div>
                   </div>
                   <div className="flex items-center justify-between text-xs font-bold text-[var(--color-text-secondary)]">
                      <div className="flex items-center gap-2">
                         <Hotel className="w-4 h-4 text-[var(--color-text-muted)]" />
                         <span>{occupancy.occupiedRooms ?? 0} phòng đang được đặt</span>
                      </div>
                      <span>Tổng: {occupancy.totalRooms}</span>
                   </div>
                 </div>
               </div>
             ) : (
               <div className="py-10 text-center text-[var(--color-text-muted)] italic text-sm">Chưa có dữ liệu thống kê.</div>
             )}
           </div>

           <div className="mt-10 p-5 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] flex items-center gap-4">
              <TrendingUp className="w-8 h-8 text-emerald-600 opacity-50" />
              <p className="text-[10px] font-medium text-[var(--color-text-secondary)] leading-relaxed uppercase tracking-widest">
                Xu hướng lấp đầy phòng {occupancy && occupancy.occupancyRate > 70 ? "Vượt ngưỡng" : "Ổn định"}
              </p>
           </div>
        </div>

        {/* Popular Room Types Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-[var(--shadow-sm)] border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-8 border-b border-[var(--color-border)] pb-4">
            <div>
               <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">Hạng phòng phổ biến</h3>
               <p className="text-xs text-[var(--color-text-muted)] font-medium italic">Sắp xếp theo số lượt đặt phòng</p>
            </div>
            <BarChart3 className="w-6 h-6 text-[var(--color-text-muted)]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popular.length === 0 && (
              <div className="md:col-span-2 py-20 text-center text-[var(--color-text-muted)] italic text-sm border-2 border-dashed border-[var(--color-border)] rounded-3xl">
                Chưa có dữ liệu đặt phòng cho khoảng thời gian này.
              </div>
            )}
            {popular.map((p, idx) => (
              <div
                key={p._id}
                className="group flex flex-col justify-between p-6 bg-[var(--color-surface)] rounded-2xl border border-transparent hover:border-[var(--color-primary)] hover:bg-white transition-all cursor-default"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                     <span className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-xs font-black shadow-sm group-hover:bg-[var(--color-primary)] transition-colors">
                        {idx + 1}
                     </span>
                     <div className="space-y-0.5">
                        <p className="text-sm font-bold text-[var(--color-text-primary)]">
                           {roomTypeNameById.get(p._id) ?? p._id}
                        </p>
                        <p className="text-[10px] text-[var(--color-text-muted)] font-mono tracking-tighter">ID: {p._id}</p>
                     </div>
                  </div>
                </div>
                
                <div className="flex items-end justify-between">
                   <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-secondary)]">
                      <Users className="w-3.5 h-3.5" />
                      <span>{p.bookings} lượt đặt</span>
                   </div>
                   <div className="flex items-center gap-1.5 text-[var(--color-primary-dark)]">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Hot</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
          
          {popular.length > 0 && (
            <div className="mt-8 flex items-center gap-2 px-4 py-3 bg-amber-50 rounded-xl border border-amber-100">
               <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Gợi ý quản trị:</span>
               <p className="text-xs text-amber-700 font-medium">
                  Hãy cân nhắc tăng giá cơ bản cho hạng phòng {roomTypeNameById.get(popular[0]._id) || "phổ biến nhất"} vào mùa cao điểm.
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
