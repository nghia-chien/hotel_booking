import { type FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../api/client";
import { toImageUrl } from "../../utils/format";
import { cn } from "../../components/ui/utils";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  DoorOpen, 
  Users, 
  Wifi, 
  ShieldCheck, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronRight,
  Upload
} from "lucide-react";
import { amenityCatalog } from "../../constants/amenities";
import PropertyAmenityIcon from "../../components/ui/PropertyAmenityIcon";
import { AdminPageHeader, AlertMessage } from "../../components/admin";

interface RoomType {
  _id: string;
  name: string;
}

interface Room {
  _id: string;
  roomNumber: string;
  capacity: number;
  amenities?: string[];
  policies?: string;
  images?: string[];
  isActive: boolean;
  roomType: RoomType;
}

interface ListResponse<T> {
  success: boolean;
  data: T[];
}

const AdminRoomsPage = () => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [roomNumber, setRoomNumber] = useState("");
  const [roomType, setRoomType] = useState("");
  const [capacity, setCapacity] = useState<number>(2);
  const [policies, setPolicies] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Advanced States
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<FileList | null>(null);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const resetForm = () => {
    setEditingId(null);
    setRoomNumber("");
    setCapacity(2);
    setPolicies("");
    setIsActive(true);
    setSelectedAmenities([]);
    setExistingImages([]);
    setNewImages(null);
    setImagesToDelete([]);
  };

  const load = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const [rt, r] = await Promise.all([
        apiRequest<ListResponse<RoomType>>("/api/room-types", "GET", undefined, {
          auth: true
        }),
        apiRequest<ListResponse<Room>>("/api/rooms", "GET", undefined, {
          auth: true
        })
      ]);
      setRoomTypes(rt.data);
      setRooms(r.data);
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

  const startEdit = (room: Room) => {
    setEditingId(room._id);
    setRoomNumber(room.roomNumber);
    setRoomType(room.roomType?._id || "");
    setCapacity(room.capacity);
    setSelectedAmenities(room.amenities ?? []);
    setExistingImages(room.images ?? []);
    setNewImages(null);
    setImagesToDelete([]);
    setPolicies(room.policies || "");
    setIsActive(room.isActive);
    setMessage(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const fd = new FormData();
      fd.append("roomNumber", roomNumber);
      fd.append("roomType", roomType);
      fd.append("capacity", String(capacity));
      fd.append("policies", policies);
      fd.append("isActive", String(isActive));
      fd.append("amenities", JSON.stringify(selectedAmenities));

      if (imagesToDelete.length > 0) {
        fd.append("imagesToDelete", JSON.stringify(imagesToDelete));
      }

      if (newImages) {
        Array.from(newImages).forEach((file) => {
          fd.append("images", file);
        });
      }

      const path = editingId ? `/api/rooms/${editingId}` : "/api/rooms";
      const method = editingId ? "PUT" : "POST";

      await apiRequest(path, method, fd, { auth: true });
      setMessage(editingId ? "Cập nhật thông tin phòng thành công." : "Đã tạo phòng mới.");
      resetForm();
      void load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phòng này? Các booking liên quan có thể bị ảnh hưởng.")) return;
    setError(null);
    setMessage(null);
    try {
      await apiRequest(`/api/rooms/${id}`, "DELETE", undefined, { auth: true });
      setMessage("Đã xóa phòng thành công.");
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
        eyebrow="Quản lý tài sản"
        title="Danh sách Phòng"
        subtitle="Đăng ký phòng mới, cập nhật tình trạng hoạt động và gán loại phòng tương ứng."
      />

      {/* Form Section */}
      <section className="bg-white rounded-3xl p-8 shadow-[var(--shadow-sm)] border border-[var(--color-border)]">
        <div className="flex items-center gap-3 mb-8 border-b border-[var(--color-border)] pb-4">
          <div className="p-2 bg-[var(--color-surface)] rounded-lg text-[var(--color-text-primary)]">
            <Plus className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
            {editingId ? "Cập nhật thông tin phòng" : "Đăng ký phòng mới"}
          </h2>
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Số phòng</label>
            <div className="relative">
              <DoorOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input
                className="w-full bg-[var(--color-surface)] border-none rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="Vd: 301, Penthouse-1"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Loại phòng</label>
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

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Sức chứa</label>
            <div className="relative">
              <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input
                type="number"
                min={1}
                className="w-full bg-[var(--color-surface)] border-none rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="space-y-3 md:col-span-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] ml-1 block">
              Tiện nghi
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {amenityCatalog.map(({ key, label }) => (
                <label
                  key={key}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all text-sm font-bold",
                    selectedAmenities.includes(key)
                      ? "bg-black text-white border-black shadow-md scale-[1.02]"
                      : "bg-[var(--color-surface)] border-transparent text-[var(--color-text-secondary)] hover:border-gray-300"
                  )}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selectedAmenities.includes(key)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAmenities((prev) => [...prev, key]);
                      } else {
                        setSelectedAmenities((prev) => prev.filter((a) => a !== key));
                      }
                    }}
                  />
                  <PropertyAmenityIcon amenityId={key} size="sm" />
                  <span className="truncate">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Tình trạng hoạt động</label>
            <select
              className="w-full bg-[var(--color-surface)] border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[var(--color-primary)] transition-all appearance-none cursor-pointer"
              value={String(isActive)}
              onChange={(e) => setIsActive(e.target.value === "true")}
            >
              <option value="true">Sẵn sàng đón khách</option>
              <option value="false">Đang bảo trì / Khóa</option>
            </select>
          </div>

          <div className="space-y-1.5 md:col-span-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Chính sách riêng của phòng</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input
                className="w-full bg-[var(--color-surface)] border-none rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                value={policies}
                onChange={(e) => setPolicies(e.target.value)}
                placeholder="Vd: Không hút thuốc,..."
              />
            </div>
          </div>

          <div className="space-y-4 md:col-span-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] ml-1 block">Hình ảnh thực tế</label>
            
            {/* Gallery ảnh hiện có - chỉ hiện khi edit */}
            {editingId && existingImages.length > 0 && (
              <div className="bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-border)]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-3 flex items-center gap-2">
                  <ImageIcon className="w-3 h-3" /> Ảnh hiện có ({existingImages.length}) <span className="text-[var(--color-text-muted)] font-normal italic lowercase">— click ✕ để xóa</span>
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                  {existingImages.map((imgPath) => {
                    const isMarkedDelete = imagesToDelete.includes(imgPath);
                    return (
                      <div key={imgPath} className="relative group aspect-square">
                        <img
                          src={toImageUrl(imgPath)}
                          alt="room"
                          className={cn(
                            "w-full h-full object-cover rounded-xl transition-all duration-300",
                            isMarkedDelete ? "opacity-30 grayscale blur-[1px]" : "opacity-100"
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (isMarkedDelete) {
                              setImagesToDelete((prev) => prev.filter((p) => p !== imgPath));
                            } else {
                              setImagesToDelete((prev) => [...prev, imgPath]);
                            }
                          }}
                          className={cn(
                            "absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full text-white flex items-center justify-center shadow-lg transition-all",
                            isMarkedDelete 
                              ? "bg-gray-500 hover:bg-black scale-110" 
                              : "bg-red-500 opacity-0 group-hover:opacity-100 hover:scale-110"
                          )}
                        >
                          {isMarkedDelete ? <Plus className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        </button>
                        {isMarkedDelete && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[9px] font-black text-red-600 bg-white shadow-sm px-1.5 py-0.5 rounded-md uppercase tracking-tighter">Sẽ xóa</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {imagesToDelete.length > 0 && (
                  <p className="text-[10px] text-red-600 font-bold mt-3 animate-pulse italic">
                    ⚠ {imagesToDelete.length} ảnh sẽ bị gỡ bỏ vĩnh viễn sau khi bạn bấm lưu.
                  </p>
                )}
              </div>
            )}

            {/* Upload ảnh mới */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="bg-white border-2 border-dashed border-[var(--color-border)] rounded-2xl p-6 transition-all hover:border-[var(--color-primary)] group text-center cursor-pointer relative overflow-hidden h-full flex flex-col items-center justify-center gap-3">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setNewImages(e.target.files)}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-10 h-10 bg-[var(--color-surface)] rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                     <Upload className="w-5 h-5 text-[var(--color-text-muted)]" />
                  </div>
                  <div>
                     <p className="text-xs font-bold text-[var(--color-text-primary)]">{editingId ? "Thêm ảnh mới" : "Tải ảnh lên"}</p>
                     <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Nhiều tệp tin (Max 5MB)</p>
                  </div>
                </div>
              </div>

              {newImages && newImages.length > 0 && (
                <div className="md:col-span-2 bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-border)]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-3">Sẽ tải lên {newImages.length} ảnh mới:</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(newImages).map((file, i) => (
                      <div key={i} className="w-14 h-14 relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`preview-${i}`}
                          className="w-full h-full object-cover rounded-lg border border-white shadow-sm"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                           <CheckCircle2 className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-3 flex items-center gap-3 pt-4">
            <button
              type="submit"
              className="px-8 py-3 bg-[var(--color-primary)] text-black text-sm font-bold uppercase tracking-widest rounded-xl shadow-[var(--shadow-sm)] hover:opacity-90 transition-all flex items-center gap-2"
            >
              {editingId ? "Lưu thay đổi" : "Tạo phòng"}
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
      <section className="space-y-6">
        <h3 className="text-lg font-bold text-[var(--color-text-primary)] px-2">Danh sách phòng hiện tại</h3>

        {loading ? (
          <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-[var(--color-border)]">
             <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {rooms.map((room) => (
              <div key={room._id} className="group bg-white rounded-3xl p-6 shadow-[var(--shadow-sm)] border border-[var(--color-border)] hover:border-gray-300 hover:shadow-[var(--shadow-md)] transition-all flex flex-col lg:flex-row gap-6">
                {/* Images */}
                <div className="w-full lg:w-48 flex-shrink-0">
                   <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[var(--color-surface)] relative">
                      {room.images && room.images.length > 0 ? (
                        <img
                          src={toImageUrl(room.images[0])}
                          alt={`Phòng ${room.roomNumber}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[var(--color-text-muted)] gap-2">
                           <ImageIcon className="w-8 h-8 opacity-20" />
                           <span className="text-[10px] font-bold uppercase tracking-widest">Không có ảnh</span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                         <span className={cn(
                           "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm",
                           room.isActive ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                         )}>
                           {room.isActive ? "ACTIVE" : "INACTIVE"}
                         </span>
                      </div>
                   </div>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between py-1">
                   <div>
                      <div className="flex items-center justify-between gap-4 mb-2">
                         <h4 className="text-xl font-bold text-[var(--color-text-primary)]">
                            Phòng {room.roomNumber} <span className="text-[var(--color-text-muted)] font-normal mx-2">·</span> {room.roomType?.name}
                         </h4>
                         <div className="flex gap-2">
                            <button
                              className="p-2.5 bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl hover:bg-gray-200 transition-colors"
                              onClick={() => startEdit(room)}
                              title="Sửa phòng"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                              onClick={() => remove(room._id)}
                              title="Xóa phòng"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </div>

                      <div className="flex flex-wrap gap-5 mb-4 text-xs font-bold text-[var(--color-text-secondary)]">
                         <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-[var(--color-text-muted)]" />
                            <span>Tối đa {room.capacity} khách</span>
                         </div>
                         {room.amenities && room.amenities.length > 0 && (
                           <div className="flex items-center gap-2">
                              <Wifi className="w-4 h-4 text-[var(--color-text-muted)]" />
                              <span className="max-w-[300px] truncate">{room.amenities.join(", ")}</span>
                           </div>
                         )}
                      </div>

                      {room.policies && (
                        <p className="text-xs text-[var(--color-text-secondary)] italic leading-relaxed border-l-2 border-[var(--color-primary)] pl-3 mb-2">
                           {room.policies}
                        </p>
                      )}
                   </div>
                   
                   <div className="flex items-center justify-end mt-4">
                      <Link 
                        to={`/roomdetail/${room._id}`}
                        target="_blank"
                        className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors inline-flex items-center gap-2"
                      >
                         Xem giao diện khách hàng <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                   </div>
                </div>
              </div>
            ))}

            {!loading && rooms.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-[var(--color-border)]">
                <p className="text-[var(--color-text-muted)] font-medium italic">Hiện chưa có phòng nào được đăng ký.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminRoomsPage;
