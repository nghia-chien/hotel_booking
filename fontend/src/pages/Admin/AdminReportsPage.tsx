import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../api/client";

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
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-2">Báo cáo</h1>
        <p className="text-sm text-gray-500">
          Occupancy rate và loại phòng được đặt nhiều nhất.
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-sm mb-1 text-gray-700">Từ ngày</label>
            <input
              type="date"
              className="w-full border border-gray-300 p-2 rounded"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700">Đến ngày</label>
            <input
              type="date"
              className="w-full border border-gray-300 p-2 rounded"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button
            className="h-10 bg-blue-600 text-white rounded-lg px-4 disabled:opacity-60"
            onClick={load}
            disabled={loading}
          >
            {loading ? "Đang tải..." : "Xem báo cáo"}
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-3">Occupancy rate</h2>
          {occupancy ? (
            <div className="space-y-2">
              <p className="text-4xl font-bold">
                {occupancy.occupancyRate.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">
                Phòng đang được “chiếm dụng”: {occupancy.occupiedRooms ?? 0}/
                {occupancy.totalRooms}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Chưa có dữ liệu.</p>
          )}
        </div>

        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-3">
            Top loại phòng được đặt
          </h2>
          <div className="space-y-2">
            {popular.length === 0 && (
              <p className="text-sm text-gray-600">Chưa có dữ liệu.</p>
            )}
            {popular.map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between rounded-xl border border-gray-100 p-3"
              >
                <div>
                  <p className="font-medium">
                    {roomTypeNameById.get(p._id) ?? p._id}
                  </p>
                  <p className="text-xs text-gray-500">{p._id}</p>
                </div>
                <span className="text-sm font-semibold">{p.bookings}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

