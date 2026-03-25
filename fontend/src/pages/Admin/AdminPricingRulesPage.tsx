import { type FormEvent, useEffect, useState } from "react";
import { apiRequest } from "../../api/client";
import { cn } from "../../components/ui/utils";
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Tag, 
  Percent, 
  DollarSign, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Tent,
  ArrowRight
} from "lucide-react";
import { AdminPageHeader, AlertMessage } from "../../components/admin";

interface RoomType {
  _id: string;
  name: string;
}

interface PricingRule {
  _id: string;
  name: string;
  roomType: RoomType;
  startDate: string;
  endDate: string;
  priceType: "fixed" | "percentage";
  value: number;
  applyWeekend: boolean;
  applyHolidays: boolean;
}

interface ListResponse<T> {
  success: boolean;
  data: T[];
}

const AdminPricingRulesPage = () => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [roomType, setRoomType] = useState("");
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priceType, setPriceType] = useState<"fixed" | "percentage">(
    "percentage"
  );
  const [value, setValue] = useState<number>(10);
  const [applyWeekend, setApplyWeekend] = useState(false);
  const [applyHolidays, setApplyHolidays] = useState(false);

  const load = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const [rt, pr] = await Promise.all([
        apiRequest<ListResponse<RoomType>>("/api/room-types", "GET", undefined, {
          auth: true
        }),
        apiRequest<ListResponse<PricingRule>>(
          "/api/pricing-rules",
          "GET",
          undefined,
          { auth: true }
        )
      ]);
      setRoomTypes(rt.data);
      setRules(pr.data);
      if (!roomType && rt.data.length > 0) {
        setRoomType(rt.data[0]._id);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (new Date(startDate) > new Date(endDate)) {
        setError("Ngày bắt đầu không thể sau ngày kết thúc.");
        return;
    }

    setError(null);
    setMessage(null);
    try {
      await apiRequest(
        "/api/pricing-rules",
        "POST",
        {
          roomType,
          name,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          priceType,
          value,
          applyWeekend,
          applyHolidays
        },
        { auth: true }
      );
      setMessage("Đã tạo luật giá mới thành công.");
      setName("");
      setValue(10);
      setApplyWeekend(false);
      setApplyHolidays(false);
      void load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa luật giá này?")) return;
    setError(null);
    setMessage(null);
    try {
      await apiRequest(`/api/pricing-rules/${id}`, "DELETE", undefined, {
        auth: true
      });
      setMessage("Đã xóa luật giá.");
      void load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-6 animate-in fade-in duration-500">
      {/* Header */}
      <AdminPageHeader
        eyebrow="Cấu hình doanh thu"
        title="Giá theo mùa & Sự kiện"
        subtitle="Thiết lập các quy tắc thay đổi giá tự động dựa trên thời điểm, ngày lễ hoặc cuối tuần."
      />

      {/* Form Section */}
      <section className="bg-white rounded-3xl p-8 shadow-[var(--shadow-sm)] border border-[var(--color-border)]">
        <div className="flex items-center gap-3 mb-8 border-b border-[var(--color-border)] pb-4">
          <div className="p-2 bg-[var(--color-surface)] rounded-lg text-[var(--color-text-primary)]">
            <Plus className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
            Tạo quy tắc giá mới
          </h2>
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Loại phòng áp dụng</label>
            <select
              className="w-full bg-[var(--color-surface)] border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[var(--color-primary)] transition-all appearance-none cursor-pointer"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              required
            >
              {roomTypes.map((rt) => (
                <option key={rt._id} value={rt._id}>
                  {rt.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Tên quy tắc (Vd: Mùa du lịch Hè 2024)</label>
            <div className="relative">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input
                className="w-full bg-[var(--color-surface)] border-none rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Vd: Ngày lễ Quốc khánh 02/09"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Kiểu thay đổi giá</label>
            <select
              className="w-full bg-[var(--color-surface)] border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[var(--color-primary)] transition-all appearance-none cursor-pointer"
              value={priceType}
              onChange={(e) =>
                setPriceType(e.target.value as "fixed" | "percentage")
              }
            >
              <option value="percentage">Tăng theo phần trăm (%)</option>
              <option value="fixed">Cộng thêm số tiền cố định (USD)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Ngày bắt đầu</label>
            <input
              type="date"
              className="w-full bg-[var(--color-surface)] border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Ngày kết thúc</label>
            <input
              type="date"
              className="w-full bg-[var(--color-surface)] border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Giá trị tăng thêm</label>
            <div className="relative">
              {priceType === "percentage" ? (
                <Percent className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              ) : (
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              )}
              <input
                type="number"
                className="w-full bg-[var(--color-surface)] border-none rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="md:col-span-2 flex items-center gap-8 px-2">
            <label className="flex items-center gap-3 group cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 rounded-md border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                checked={applyWeekend}
                onChange={(e) => setApplyWeekend(e.target.checked)}
              />
              <span className="text-sm font-bold text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]">Cuối tuần (T7, CN)</span>
            </label>
            <label className="flex items-center gap-3 group cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 rounded-md border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                checked={applyHolidays}
                onChange={(e) => setApplyHolidays(e.target.checked)}
              />
              <span className="text-sm font-bold text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]">Sự kiện & Ngày lễ</span>
            </label>
          </div>

          <div className="md:col-span-3 lg:col-span-3 flex justify-end pt-4">
            <button
              type="submit"
              className="px-8 py-3 bg-black text-white text-sm font-bold uppercase tracking-widest rounded-xl shadow-[var(--shadow-sm)] hover:bg-gray-800 transition-all flex items-center gap-2"
            >
              Áp dụng quy tắc
            </button>
          </div>
        </form>
      </section>

      {/* Messages */}
      <AlertMessage type="error" message={error || ""} />
      <AlertMessage type="success" message={message || ""} />

      {/* List Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-[var(--color-text-primary)] px-2">Quy tắc đang hiệu lực</h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-[var(--color-border)]">
             <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rules.map((r) => (
              <div key={r._id} className="group bg-white rounded-3xl p-6 shadow-[var(--shadow-sm)] border border-[var(--color-border)] hover:border-gray-300 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-text-primary)] group-hover:bg-[var(--color-primary)] transition-colors">
                    <Tent className="w-5 h-5" />
                  </div>
                  <button
                    className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                    onClick={() => remove(r._id)}
                    title="Gỡ bỏ quy tắc"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h4 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">{r.name}</h4>
                <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">{r.roomType?.name}</p>
                
                <div className="bg-[var(--color-surface)] rounded-2xl p-4 space-y-3">
                   <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[var(--color-text-muted)] uppercase tracking-widest">Thời gian</span>
                      <div className="flex items-center gap-2 text-[var(--color-text-primary)]">
                         <span>{new Date(r.startDate).toLocaleDateString('vi-VN')}</span>
                         <ArrowRight className="w-3 h-3" />
                         <span>{new Date(r.endDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                   </div>
                   <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[var(--color-text-muted)] uppercase tracking-widest">Biến động giá</span>
                      <span className="px-2.5 py-1 bg-[var(--color-primary)] rounded-lg text-black">
                         {r.priceType === "percentage" ? `+${r.value}%` : `+${r.value.toLocaleString()} USD`}
                      </span>
                   </div>
                </div>

                <div className="mt-4 flex gap-3">
                   {r.applyWeekend && (
                     <span className="flex items-center gap-1 text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        <Clock className="w-3 h-3" /> Weekend
                     </span>
                   )}
                   {r.applyHolidays && (
                     <span className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                        <Calendar className="w-3 h-3" /> Holiday
                     </span>
                   )}
                </div>
              </div>
            ))}
            
            {!loading && rules.length === 0 && (
              <div className="md:col-span-2 text-center py-20 bg-white rounded-3xl border-2 border-dashed border-[var(--color-border)]">
                <p className="text-[var(--color-text-muted)] font-medium italic">Không có quy tắc giá nào được cài đặt.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminPricingRulesPage;
