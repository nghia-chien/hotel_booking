import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import { API_BASE_URL, apiRequest } from "../api/client";
import { Button } from "../components/ui/button";

interface RoomType {
  _id: string;
  name: string;
  basePrice?: number;
  description?: string;
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

interface RoomResponse {
  success: boolean;
  data: Room;
}

const toImageUrl = (url: string) =>
  url.startsWith("/") ? `${API_BASE_URL}${url}` : url;

const formatUSD = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);

export default function RoomDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoom = async () => {
      if (!id) {
        setError("Không tìm thấy phòng.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await apiRequest<RoomResponse>(
          `/api/public/rooms/${id}`,
          "GET"
        );
        setRoom(res.data);
        if (res.data.images && res.data.images.length > 0) {
          setActiveImage(res.data.images[0]);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    void fetchRoom();
  }, [id]);

  if (loading) {
    return <p>Đang tải thông tin phòng...</p>;
  }

  if (error || !room) {
    return (
      <div className="space-y-3">
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <p className="text-red-600 text-sm">
          {error ?? "Không tìm thấy thông tin phòng."}
        </p>
      </div>
    );
  }

  const images = room.images || [];
  const hero = activeImage ? toImageUrl(activeImage) : images[0] ? toImageUrl(images[0]) : "";

  return (
    <div className="min-h-[calc(100vh-140px)]" style={{ maxWidth: 1440, margin: "0 auto" }}>
      {/* Header */}
      <header className="mb-6 flex items-center gap-3">
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <h1 className="text-xl md:text-2xl font-semibold text-[#2C2C2C]">
          Chi tiết phòng · {room.roomType?.name || "Phòng"}
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        {/* Left: images + description */}
        <div className="space-y-6">
          {/* Gallery */}
          <div className="bg-[#F7F2EA] rounded-2xl overflow-hidden border border-black/5">
            <div className="aspect-[4/3] bg-[#EFE8DE]">
              {hero ? (
                <img
                  src={hero}
                  alt={`Phòng ${room.roomNumber}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-black/50">
                  Chưa có ảnh phòng
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto bg-white">
                {images.map((img) => (
                  <img
                    key={img}
                    src={toImageUrl(img)}
                    alt="thumb"
                    className={`w-16 h-16 rounded-xl object-cover cursor-pointer border transition ${
                      img === activeImage
                        ? "border-black/60"
                        : "border-black/10 hover:border-black/40"
                    }`}
                    onClick={() => setActiveImage(img)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <section className="bg-white border border-black/5 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-black/50">
                  {room.roomType?.name || "Loại phòng"}
                </p>
                <h2 className="text-2xl font-semibold text-[#1F1F1F]">
                  Phòng #{room.roomNumber}
                </h2>
                <p className="text-sm text-black/60 mt-1">
                  Sức chứa tối đa: {room.capacity} khách
                </p>
              </div>
              <div className="flex items-center gap-1 text-sm text-black/60">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-[#FFD700] text-[#FFD700]"
                  />
                ))}
                <span className="ml-1 text-xs">(demo rating)</span>
              </div>
            </div>

            {room.roomType?.description && (
              <p className="text-sm text-black/65">
                {room.roomType.description}
              </p>
            )}

            {room.policies && (
              <div className="pt-2 border-t border-black/5 mt-2">
                <h3 className="text-sm font-medium text-[#2C2C2C] mb-1">
                  Chính sách
                </h3>
                <p className="text-sm text-black/60">{room.policies}</p>
              </div>
            )}

            {room.amenities && room.amenities.length > 0 && (
              <div className="pt-2 border-t border-black/5 mt-2">
                <h3 className="text-sm font-medium text-[#2C2C2C] mb-1">
                  Tiện nghi
                </h3>
                <p className="text-sm text-black/60">
                  {room.amenities.join(", ")}
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Right: booking summary (read-only) */}
        <aside className="bg-white border border-black/5 rounded-2xl p-5 shadow-sm h-fit space-y-4">
          <h3 className="text-lg font-semibold text-[#1F1F1F] mb-2">
            Thông tin giá
          </h3>
          <p className="text-sm text-black/60">
            Giá cơ bản (theo loại phòng):
          </p>
          <p className="text-2xl font-semibold text-[#2B2B2B]">
            {room.roomType?.basePrice != null
              ? formatUSD(room.roomType.basePrice)
              : "Liên hệ"}
            {room.roomType?.basePrice != null && (
              <span className="text-xs text-black/50 ml-1">/ đêm (chưa tính giá theo mùa)</span>
            )}
          </p>
          <p className="text-xs text-black/50">
            Giá hiển thị chỉ mang tính tham khảo. Giá thực tế khi đặt phòng được
            tính theo ngày ở, pricing rules và khuyến mãi hiện hành.
          </p>
          <Button
            className="w-full mt-2 bg-[#2B2B2B] hover:bg-black text-white rounded-xl"
            onClick={() => navigate("/rooms")}
          >
            Quay lại tìm phòng
          </Button>
        </aside>
      </div>
    </div>
  );
}
