import { type FormEvent, useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

interface RoomType {
  _id: string;
  name: string;
}

interface Room {
  _id: string;
  roomNumber: string;
  capacity: number;
  roomType: RoomType;
  images?: string[];
  amenities?: string[];
  policies?: string;
}

interface SearchResultItem {
  room: Room;
  totalPrice: number;
}

interface SearchResponse {
  success: boolean;
  data: SearchResultItem[];
}

const RoomsPage = () => {
  const { user } = useAuth();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    setCheckIn(today.toISOString().split("T")[0]);
    setCheckOut(tomorrow.toISOString().split("T")[0]);
  }, []);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const params = new URLSearchParams({
        checkIn: new Date(checkIn).toISOString(),
        checkOut: new Date(checkOut).toISOString(),
        guests: guests.toString()
      }).toString();

      const res = await apiRequest<SearchResponse>(
        `/api/bookings/search?${params}`,
        "GET"
      );
      setResults(res.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (roomId: string, totalPrice: number) => {
    if (!user) {
      setError("Vui lòng đăng nhập để đặt phòng");
      return;
    }
    setError(null);
    setMessage(null);
    try {
      const body = {
        roomId,
        checkIn: new Date(checkIn).toISOString(),
        checkOut: new Date(checkOut).toISOString(),
        guests
      };

      const booking = await apiRequest<{
        success: boolean;
        data: { _id: string };
      }>("/api/bookings", "POST", body, { auth: true });

      await apiRequest(`/api/bookings/${booking.data._id}/pay`, "POST", null, {
        auth: true
      });

      setMessage(`Đặt phòng thành công! Tổng tiền: ${totalPrice.toFixed(2)} $`);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Tìm phòng khách sạn</h1>
        <p className="text-sm text-gray-500">
          Chọn ngày, số khách và hệ thống sẽ tự gợi ý các phòng trống phù hợp.
        </p>
      </div>

      <form
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-white border border-gray-100 shadow-sm rounded-2xl p-4"
        onSubmit={handleSearch}
      >
        <div>
          <label className="block text-sm mb-1">Ngày nhận phòng</label>
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Ngày trả phòng</label>
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Số khách</label>
          <input
            type="number"
            min={1}
            className="w-full border p-2 rounded"
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            required
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded-lg disabled:opacity-60 hover:bg-blue-700 transition"
          >
            {loading ? "Đang tìm..." : "Tìm phòng"}
          </button>
        </div>
      </form>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {message && <p className="text-green-600 mb-4">{message}</p>}

      <div className="space-y-4">
        {results.map((item) => (
          <div
            key={item.room._id}
            className="border border-gray-100 bg-white rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between shadow-sm"
          >
            <div>
              <div className="flex flex-col md:flex-row gap-3">
                {item.room.images && item.room.images.length > 0 && (
                  <div className="md:w-40 w-full">
                    <div className="aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
                      <img
                        src={item.room.images[0]}
                        alt={`Phòng ${item.room.roomNumber}`}
                        className="w-full h-full object-cover cursor-pointer hover:scale-[1.02] transition"
                        onClick={() => setSelectedImage(item.room.images?.[0] ?? null)}
                      />
                    </div>
                    {item.room.images.length > 1 && (
                      <div className="flex gap-2 mt-2 overflow-x-auto">
                        {item.room.images.slice(1).map((img, idx) => (
                          <img
                            key={img}
                            src={img}
                            alt={`Phòng ${item.room.roomNumber} - ${idx + 2}`}
                            className="w-14 h-14 rounded-lg object-cover cursor-pointer border border-gray-200 hover:border-blue-500"
                            onClick={() => setSelectedImage(img)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <h2 className="font-semibold text-lg">
                    Phòng {item.room.roomNumber} · {item.room.roomType?.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Sức chứa: {item.room.capacity} khách
                  </p>
                  {item.room.amenities && item.room.amenities.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      Tiện nghi: {item.room.amenities.join(", ")}
                    </p>
                  )}
                  {item.room.policies && (
                    <p className="text-sm text-gray-500 mt-1">
                      Chính sách: {item.room.policies}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-3 md:mt-0 text-right">
              <p className="font-bold text-lg mb-2">
                {item.totalPrice.toFixed(2)} $
              </p>
              <button
                onClick={() => handleBook(item.room._id, item.totalPrice)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Đặt phòng
              </button>
            </div>
          </div>
        ))}

        {!loading && results.length === 0 && (
          <p className="text-gray-600">
            Không tìm thấy phòng phù hợp. Hãy thử lại với điều kiện khác.
          </p>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-40"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-3xl max-h-[80vh] px-4">
            <img
              src={selectedImage}
              alt="Ảnh phòng"
              className="w-full h-full object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsPage;
