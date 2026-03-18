import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";

interface RoomType {
  _id: string;
  name: string;
}

interface Room {
  _id: string;
  roomNumber: string;
  capacity: number;
  roomType?: RoomType;
  images?: string[];
}

interface SearchResultItem {
  room: Room;
  totalPrice: number;
}

interface SearchResponse {
  success: boolean;
  data: SearchResultItem[];
  meta?: {
    total?: number;
  };
}

const HomePage = () => {
  const [highlightRooms, setHighlightRooms] = useState<SearchResultItem[]>([]);
  const [totalAvailable, setTotalAvailable] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHighlightRooms = async () => {
      try {
        setLoading(true);
        setError(null);

        const today = new Date();
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

        const params = new URLSearchParams({
          checkIn: today.toISOString(),
          checkOut: tomorrow.toISOString(),
          guests: "1",
          limit: "6"
        }).toString();

        const res = await apiRequest<SearchResponse>(
          `/api/bookings/search?${params}`,
          "GET"
        );

        setHighlightRooms(res.data || []);
        if (res.meta?.total != null) {
          setTotalAvailable(res.meta.total);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchHighlightRooms();
  }, []);

  return (
    <div className="space-y-12">
      <section className="grid gap-10 md:grid-cols-2 items-center">
        <div>
          <p className="text-sm font-semibold tracking-wide text-blue-600 uppercase mb-3">
            Smart Hotel Booking
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Đặt phòng khách sạn
            <span className="text-blue-600"> nhanh chóng</span> và{" "}
            <span className="text-blue-600">an toàn</span>.
          </h1>
          <p className="text-gray-600 mb-6">
            Tìm kiếm phòng theo ngày, giá, sức chứa và loại phòng. Quản lý
            booking, check-in / check-out và giá theo mùa trên một nền tảng duy
            nhất.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/rooms"
              className="px-5 py-3 rounded-lg bg-blue-600 text-white font-medium shadow-sm hover:bg-blue-700 transition"
            >
              Bắt đầu tìm phòng
            </Link>
            <Link
              to="/login"
              className="px-5 py-3 rounded-lg border border-gray-300 text-gray-800 font-medium hover:bg-gray-100 transition"
            >
              Đăng nhập quản lý booking
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-400 shadow-xl flex items-center justify-center text-white">
            <div className="space-y-4 px-8">
              <p className="text-lg font-semibold">
                Trạng thái phòng theo thời gian thực
              </p>
              <p className="text-sm text-blue-50">
                Không còn lo over-booking. Hệ thống tự động kiểm tra trùng
                lịch, chính sách huỷ và giá theo mùa.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-lg mb-2">Đặt phòng trực tuyến</h3>
          <p className="text-sm text-gray-600">
            Tìm kiếm theo ngày nhận / trả phòng, sức chứa, giá và loại phòng.
            Thanh toán mock, theo dõi booking cá nhân.
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-lg mb-2">Quản lý giá theo mùa</h3>
          <p className="text-sm text-gray-600">
            Thiết lập pricing rules theo khoảng ngày, cuối tuần / ngày lễ, tự
            động tính tổng tiền khi đặt phòng.
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-lg mb-2">Dashboard cho Admin</h3>
          <p className="text-sm text-gray-600">
            CRUD phòng, loại phòng, pricing rules. Quản lý booking, check-in /
            check-out và xem occupancy rate.
          </p>
        </div>
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-semibold">
              Gợi ý phòng trống hôm nay
            </h2>
            <p className="text-sm text-gray-500">
              Dữ liệu lấy trực tiếp từ MongoDB thông qua API tìm phòng.
            </p>
          </div>
          <Link
            to="/rooms"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Xem tất cả phòng
          </Link>
        </div>

        {error && (
          <p className="text-sm text-red-600 mb-3">
            Không tải được danh sách phòng: {error}
          </p>
        )}

        {loading && (
          <p className="text-sm text-gray-500">Đang tải phòng trống...</p>
        )}

        {!loading && !error && highlightRooms.length === 0 && (
          <p className="text-sm text-gray-500">
            Hiện chưa có phòng trống phù hợp cho hôm nay.
          </p>
        )}

        {!loading && highlightRooms.length > 0 && (
          <>
            {totalAvailable != null && (
              <p className="text-sm text-gray-600 mb-3">
                Tìm thấy {totalAvailable} phòng trống, hiển thị tối đa{" "}
                {highlightRooms.length}.
              </p>
            )}
            <div className="grid gap-4 md:grid-cols-3">
              {highlightRooms.map((item) => (
                <div
                  key={item.room._id}
                  className="border border-gray-100 bg-white rounded-2xl p-4 shadow-sm flex flex-col"
                >
                  {item.room.images && item.room.images.length > 0 && (
                    <div className="mb-3">
                      <div className="aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
                        <img
                          src={item.room.images[0]}
                          alt={`Phòng ${item.room.roomNumber}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-base mb-1">
                        Phòng {item.room.roomNumber}
                        {item.room.roomType?.name && (
                          <span className="text-gray-600">
                            {" "}
                            · {item.room.roomType.name}
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">
                        Sức chứa {item.room.capacity} khách
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="font-bold text-lg text-blue-600">
                        {item.totalPrice.toFixed(2)} $
                      </p>
                      <Link
                        to="/rooms"
                        className="text-sm px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                      >
                        Đặt ngay
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default HomePage;