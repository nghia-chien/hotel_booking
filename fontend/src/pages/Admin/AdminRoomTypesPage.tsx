import {  useEffect, useState } from "react";
import { apiRequest } from "../../api/client";

interface RoomType {
  _id: string;
  name: string;
  description?: string;
  basePrice: number;
  defaultCapacity: number;
}

interface ListResponse {
  success: boolean;
  data: RoomType[];
}

const AdminRoomTypesPage = () => {
  const [items, setItems] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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

  const load = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await apiRequest<ListResponse>("/api/room-types", "GET", undefined, {
        auth: true
      });
      setItems(res.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const startEdit = (rt: RoomType) => {
    setEditingId(rt._id);
    setName(rt.name);
    setDescription(rt.description || "");
    setBasePrice(rt.basePrice);
    setDefaultCapacity(rt.defaultCapacity);
    setMessage(null);
    setError(null);
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const payload = { name, description, basePrice, defaultCapacity };
      if (editingId) {
        await apiRequest(`/api/room-types/${editingId}`, "PUT", payload, {
          auth: true
        });
        setMessage("Updated room type");
      } else {
        await apiRequest(`/api/room-types`, "POST", payload, { auth: true });
        setMessage("Created room type");
      }
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
      await apiRequest(`/api/room-types/${id}`, "DELETE", undefined, {
        auth: true
      });
      setMessage("Deleted room type");
      if (editingId === id) resetForm();
      void load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin · Loại phòng</h1>

      <form className="border border-gray-100 bg-white rounded-2xl p-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 shadow-sm" onSubmit={submit}>
        <div>
          <label className="block text-sm mb-1">Tên loại phòng</label>
          <input
            className="w-full border p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Giá cơ bản (1 đêm)</label>
          <input
            type="number"
            min={0}
            className="w-full border p-2 rounded"
            value={basePrice}
            onChange={(e) => setBasePrice(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Sức chứa mặc định</label>
          <input
            type="number"
            min={1}
            className="w-full border p-2 rounded"
            value={defaultCapacity}
            onChange={(e) => setDefaultCapacity(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Mô tả</label>
          <input
            className="w-full border p-2 rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="md:col-span-2 flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition" type="submit">
            {editingId ? "Cập nhật loại phòng" : "Tạo loại phòng"}
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
        {items.map((rt) => (
          <div key={rt._id} className="border border-gray-100 bg-white rounded-2xl p-3 flex justify-between items-start shadow-sm">
            <div>
              <p className="font-semibold">{rt.name}</p>
              <p className="text-sm text-gray-600">
                Giá cơ bản: {rt.basePrice} · Sức chứa: {rt.defaultCapacity}
              </p>
              {rt.description && (
                <p className="text-sm text-gray-500 mt-1">{rt.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                className="text-sm bg-gray-200 px-3 py-1 rounded-lg"
                onClick={() => startEdit(rt)}
              >
                Sửa
              </button>
              <button
                className="text-sm bg-red-600 text-white px-3 py-1 rounded-lg"
                onClick={() => remove(rt._id)}
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && (
          <p className="text-gray-600">Chưa có loại phòng nào.</p>
        )}
      </div>
    </div>
  );
};

export default AdminRoomTypesPage;

