/* eslint-disable react-hooks/exhaustive-deps */
import {  useEffect, useState } from "react";
import { apiRequest } from "../../api/client";

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

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
      setMessage("Created pricing rule");
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
    setError(null);
    setMessage(null);
    try {
      await apiRequest(`/api/pricing-rules/${id}`, "DELETE", undefined, {
        auth: true
      });
      setMessage("Deleted pricing rule");
      void load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin · Giá theo mùa</h1>

      <form className="border border-gray-100 bg-white rounded-2xl p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 shadow-sm" onSubmit={submit}>
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
          <label className="block text-sm mb-1">Tên rule</label>
          <input
            className="w-full border p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Kiểu giá</label>
          <select
            className="w-full border p-2 rounded"
            value={priceType}
            onChange={(e) =>
              setPriceType(e.target.value as "fixed" | "percentage")
            }
          >
            <option value="percentage">Tăng theo %</option>
            <option value="fixed">Cộng cố định</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Bắt đầu</label>
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Kết thúc</label>
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Giá trị</label>
            <input
            type="number"
            className="w-full border p-2 rounded"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            required
          />
        </div>

        <div className="md:col-span-3 flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={applyWeekend}
              onChange={(e) => setApplyWeekend(e.target.checked)}
            />
            Áp dụng cuối tuần
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={applyHolidays}
              onChange={(e) => setApplyHolidays(e.target.checked)}
            />
            Áp dụng ngày lễ
          </label>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition" type="submit">
            Tạo rule
          </button>
        </div>
      </form>

      {loading && <p>Đang tải...</p>}
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {message && <p className="text-green-600 mb-2">{message}</p>}

      <div className="space-y-3">
        {rules.map((r) => (
          <div key={r._id} className="border border-gray-100 bg-white rounded-2xl p-3 flex justify-between shadow-sm">
            <div>
              <p className="font-semibold">{r.name}</p>
              <p className="text-sm text-gray-600">
                {r.roomType?.name} · {r.priceType === "percentage" ? "Tăng %" : "Cộng cố định"} {r.value} ·{" "}
                {new Date(r.startDate).toLocaleDateString()} -{" "}
                {new Date(r.endDate).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500">
                Cuối tuần: {String(r.applyWeekend)} · Ngày lễ:{" "}
                {String(r.applyHolidays)}
              </p>
            </div>
            <div>
              <button
                className="text-sm bg-red-600 text-white px-3 py-1 rounded-lg"
                onClick={() => remove(r._id)}
              >
                Xóa
              </button>
            </div>
          </div>
        ))}

        {!loading && rules.length === 0 && (
          <p className="text-gray-600">Chưa có pricing rule nào.</p>
        )}
      </div>
    </div>
  );
};

export default AdminPricingRulesPage;

