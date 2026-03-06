import {  useEffect, useMemo, useState } from "react";
import { API_BASE_URL, apiRequest } from "../../api/client";

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
  const [amenitiesText, setAmenitiesText] = useState("");
  const [policies, setPolicies] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [images, setImages] = useState<FileList | null>(null);

  const amenities = useMemo(() => {
    return amenitiesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [amenitiesText]);

  const resetForm = () => {
    setEditingId(null);
    setRoomNumber("");
    setCapacity(2);
    setAmenitiesText("");
    setPolicies("");
    setIsActive(true);
    setImages(null);
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
    setAmenitiesText((room.amenities || []).join(", "));
    setPolicies(room.policies || "");
    setIsActive(room.isActive);
    setImages(null);
    setMessage(null);
    setError(null);
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      fd.append("amenities", JSON.stringify(amenities));

      if (images) {
        Array.from(images).forEach((file) => {
          fd.append("images", file);
        });
      }

      const path = editingId ? `/api/rooms/${editingId}` : "/api/rooms";
      const method = editingId ? "PUT" : "POST";

      await apiRequest(path, method, fd, { auth: true });
      setMessage(editingId ? "Updated room" : "Created room");
      resetForm();
      void load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const remove = async (id: string) => {
    setError(null);
    setMessage(null);
    try {
      await apiRequest(`/api/rooms/${id}`, "DELETE", undefined, { auth: true });
      setMessage("Deleted room");
      if (editingId === id) resetForm();
      void load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin · Quản lý phòng</h1>

      <form className="border border-gray-100 bg-white rounded-2xl p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 shadow-sm" onSubmit={submit}>
        <div>
          <label className="block text-sm mb-1">Số phòng</label>
          <input
            className="w-full border p-2 rounded"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Loại phòng</label>
          <select
            className="w-full border p-2 rounded"
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

        <div>
          <label className="block text-sm mb-1">Sức chứa</label>
          <input
            type="number"
            min={1}
            className="w-full border p-2 rounded"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Tiện nghi (phân tách bằng dấu phẩy)</label>
          <input
            className="w-full border p-2 rounded"
            value={amenitiesText}
            onChange={(e) => setAmenitiesText(e.target.value)}
            placeholder="wifi, tv, minibar"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Đang hoạt động</label>
          <select
            className="w-full border p-2 rounded"
            value={String(isActive)}
            onChange={(e) => setIsActive(e.target.value === "true")}
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm mb-1">Chính sách</label>
          <input
            className="w-full border p-2 rounded"
            value={policies}
            onChange={(e) => setPolicies(e.target.value)}
            placeholder="No smoking..."
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm mb-1">Ảnh phòng (có thể chọn nhiều)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImages(e.target.files)}
          />
        </div>

        <div className="md:col-span-3 flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition" type="submit">
            {editingId ? "Cập nhật phòng" : "Tạo phòng mới"}
          </button>
          {editingId && (
            <button
              type="button"
              className="bg-gray-200 px-4 py-2 rounded-lg"
              onClick={resetForm}
            >
              Hủy
            </button>
          )}
        </div>
      </form>

      {loading && <p>Đang tải...</p>}
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {message && <p className="text-green-600 mb-2">{message}</p>}

      <div className="space-y-3">
        {rooms.map((room) => (
          <div key={room._id} className="border border-gray-100 bg-white rounded-2xl p-3 flex justify-between items-start shadow-sm">
            <div className="flex gap-3">
              {room.images && room.images.length > 0 && (
                <div className="w-28">
                  <div className="aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={
                        room.images[0].startsWith("/")
                          ? `${API_BASE_URL}${room.images[0]}`
                          : room.images[0]
                      }
                      alt={`Phòng ${room.roomNumber}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              <div>
                <p className="font-semibold">
                  Phòng {room.roomNumber} · {room.roomType?.name}
                </p>
                <p className="text-sm text-gray-600">
                  Sức chứa: {room.capacity} · Hoạt động: {String(room.isActive)}
                </p>
                {room.amenities && room.amenities.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Tiện nghi: {room.amenities.join(", ")}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="text-sm bg-gray-200 px-3 py-1 rounded-lg"
                onClick={() => startEdit(room)}
              >
                Sửa
              </button>
              <button
                className="text-sm bg-red-600 text-white px-3 py-1 rounded-lg"
                onClick={() => remove(room._id)}
              >
                Xóa
              </button>
            </div>
          </div>
        ))}

        {!loading && rooms.length === 0 && (
          <p className="text-gray-600">Chưa có phòng nào.</p>
        )}
      </div>
    </div>
  );
};

export default AdminRoomsPage;

