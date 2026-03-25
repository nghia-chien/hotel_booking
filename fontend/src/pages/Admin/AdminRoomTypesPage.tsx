import { type FormEvent, useState } from "react";
import { apiRequest } from "../../api/client";
import { useAdminData } from "../../hooks/useAdminData";
import { cn } from "../../components/ui/utils";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Layers, 
  DollarSign, 
  Users, 
  X,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { AdminPageHeader, AlertMessage } from "../../components/admin";

interface RoomType {
  _id: string;
  name: string;
  description?: string;
  basePrice: number;
  defaultCapacity: number;
}



const AdminRoomTypesPage = () => {
  const {
    data: itemsData,
    loading,
    error,
    success: message,
    setError,
    setSuccess: setMessage,
    reload: load,
  } = useAdminData<RoomType[]>({ path: "/api/room-types" });
  const items = itemsData ?? [];

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState<number>(100);
  const [defaultCapacity, setDefaultCapacity] = useState<number>(2);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setBasePrice(100);
    setDefaultCapacity(2);
  };

  const startEdit = (rt: RoomType) => {
    setEditingId(rt._id);
    setName(rt.name);
    setDescription(rt.description || "");
    setBasePrice(rt.basePrice);
    setDefaultCapacity(rt.defaultCapacity);
    setMessage(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const payload = { name, description, basePrice, defaultCapacity };
      if (editingId) {
        await apiRequest(`/api/room-types/${editingId}`, "PUT", payload, {
          auth: true
        });
        setMessage("Cập nhật loại phòng thành công.");
      } else {
        await apiRequest(`/api/room-types`, "POST", payload, { auth: true });
        setMessage("Đã thêm loại phòng mới.");
      }
      resetForm();
      void load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa loại phòng này?")) return;
    setError(null);
    setMessage(null);
    try {
      await apiRequest(`/api/room-types/${id}`, "DELETE", undefined, {
        auth: true
      });
      setMessage("Đã xóa loại phòng.");
      if (editingId === id) resetForm();
      void load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-6 animate-in fade-in duration-500">
      {/* Header */}
      <AdminPageHeader
        eyebrow="Cấu hình hệ thống"
        title="Loại phòng"
        subtitle="Quản lý các hạng phòng, giá cơ bản và sức chứa mặc định của khách sạn."
      />

      {/* Form Section */}
      <section className="bg-white rounded-3xl p-8 shadow-[var(--shadow-sm)] border border-[var(--color-border)]">
        <div className="flex items-center gap-3 mb-8 border-b border-[var(--color-border)] pb-4">
          <div className="p-2 bg-[var(--color-surface)] rounded-lg text-[var(--color-text-primary)]">
            <Plus className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
            {editingId ? "Cập nhật loại phòng" : "Thêm loại phòng mới"}
          </h2>
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1.5 lg:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Tên loại phòng</label>
            <input
              className="w-full bg-[var(--color-surface)] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Vd: Deluxe Ocean View"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Giá cơ bản / đêm</label>
            <div className="relative">
              <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input
                type="number"
                min={0}
                className="w-full bg-[var(--color-surface)] border-none rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Sức chứa tối đa</label>
            <div className="relative">
              <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input
                type="number"
                min={1}
                className="w-full bg-[var(--color-surface)] border-none rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                value={defaultCapacity}
                onChange={(e) => setDefaultCapacity(Number(e.target.value))}
                required
              />
            </div>
          </div>
          <div className="space-y-1.5 lg:col-span-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Mô tả chi tiết</label>
            <textarea
              className="w-full bg-[var(--color-surface)] border-none rounded-xl px-4 py-3 text-sm min-h-[100px] focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn gọn về đặc điểm của loại phòng này..."
            />
          </div>

          <div className="lg:col-span-4 flex items-center gap-3 pt-4">
            <button
              type="submit"
              className="px-8 py-3 bg-[var(--color-primary)] text-black text-sm font-bold uppercase tracking-widest rounded-xl shadow-[var(--shadow-sm)] hover:opacity-90 transition-all flex items-center gap-2"
            >
              {editingId ? "Lưu thay đổi" : "Tạo loại phòng"}
            </button>
            {editingId && (
              <button
                type="button"
                className="px-6 py-3 bg-[var(--color-surface)] text-[var(--color-text-primary)] text-sm font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2"
                onClick={resetForm}
              >
                <X className="w-4 h-4" /> Hủy
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Messages */}
      <AlertMessage type="error" message={error || ""} />
      <AlertMessage type="success" message={message || ""} />

      {/* List Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-[var(--color-text-primary)] px-2">Danh sách hiện có</h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-[var(--color-border)]">
             <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((rt) => (
              <div key={rt._id} className="group bg-white rounded-3xl p-6 shadow-[var(--shadow-sm)] border border-[var(--color-border)] hover:border-gray-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-text-primary)] group-hover:bg-[var(--color-primary)] transition-colors">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div className="flex gap-2">
                       <button
                         className="p-2.5 bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl hover:bg-gray-200 transition-colors"
                         onClick={() => startEdit(rt)}
                         title="Chỉnh sửa"
                       >
                         <Pencil className="w-4 h-4" />
                       </button>
                       <button
                         className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                         onClick={() => remove(rt._id)}
                         title="Xóa"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">{rt.name}</h4>
                  <div className="flex flex-wrap gap-4 mb-4">
                     <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-secondary)]">
                        <DollarSign className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                        <span>{rt.basePrice.toLocaleString()} USD / đêm</span>
                     </div>
                     <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-secondary)]">
                        <Users className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                        <span>Tối đa {rt.defaultCapacity} khách</span>
                     </div>
                  </div>
                  
                  {rt.description && (
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed italic line-clamp-3">
                      "{rt.description}"
                    </p>
                  )}
                </div>
              </div>
            ))}
            
            {!loading && items.length === 0 && (
              <div className="md:col-span-2 text-center py-20 bg-white rounded-3xl border-2 border-dashed border-[var(--color-border)]">
                <p className="text-[var(--color-text-muted)] font-medium italic">Không tìm thấy dữ liệu loại phòng nào.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminRoomTypesPage;
