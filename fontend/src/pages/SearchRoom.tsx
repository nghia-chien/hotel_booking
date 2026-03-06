  import { useEffect, useMemo, useState } from "react";
  import { API_BASE_URL, apiRequest } from "../api/client";
  import { SearchBar } from "../components/SearchBar";
  import { FilterSidebar } from "../components/FilterSideBar";
  import { RoomCard } from "../components/RoomCard";
  import { useNavigate } from "react-router-dom";
  import "react-day-picker/style.css";
  import { calculatePrice } from "../untils/calculatePrice";
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

  const amenityCatalog = [
    { key: "wifi", label: "Wi‑Fi" },
    { key: "pool", label: "Hồ bơi" },
    { key: "breakfast", label: "Bữa sáng" },
    { key: "parking", label: "Bãi đỗ xe" },
    { key: "gym", label: "Phòng gym" }
  ] as const;

  type AmenityKey = (typeof amenityCatalog)[number]["key"];

  const toImageUrl = (url: string) => (url.startsWith("/") ? `${API_BASE_URL}${url}` : url);

  const formatUSD = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

  const estimateRating = (roomId: string) => {
    // deterministic pseudo rating: 3.8 - 5.0
    let hash = 0;
    for (let i = 0; i < roomId.length; i++) hash = (hash * 31 + roomId.charCodeAt(i)) >>> 0;
    return 3.8 + (hash % 13) / 10;
  };

  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  const RoomsPage = () => {
    const navigate = useNavigate();

    const [searchParams, setSearchParams] = useState<{
      checkIn: Date;
      checkOut: Date;
      guests: number;
    } | null>(null);

    const [results, setResults] = useState<SearchResultItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [minPrice, setMinPrice] = useState<number>(0);
    const [maxPrice, setMaxPrice] = useState<number>(1500);
    const [selectedAmenities, setSelectedAmenities] = useState<AmenityKey[]>([]);
    const [minRating, setMinRating] = useState<number>(0);

    const [selectedRoom, setSelectedRoom] = useState<SearchResultItem | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
      // có thể pre-load dữ liệu nếu muốn
    }, []);

    const handleSearch = async ({
      checkIn,
      checkOut,
      guests
    }: {
      checkIn?: Date;
      checkOut?: Date;
      guests: number;
    }) => {
      if (!checkIn || !checkOut) {
        setError("Vui lòng chọn ngày nhận và trả phòng");
        return;
      }
      setSearchParams({ checkIn, checkOut, guests });
      setError(null);
      setLoading(true);
      try {
        const params = new URLSearchParams({
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          guests: String(guests),
          minPrice: String(minPrice),
          maxPrice: String(maxPrice)
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

    const filteredResults = useMemo(() => {
      return results.filter(({ room, totalPrice }) => {
        if (totalPrice < minPrice || totalPrice > maxPrice) return false;

        if (selectedAmenities.length > 0) {
          const roomAmenities = (room.amenities || []).map((a) => a.toLowerCase());
          const ok = selectedAmenities.every((a) =>
            roomAmenities.some((ra) => ra.includes(a))
          );
          if (!ok) return false;
        }

        if (minRating > 0) {
          const rating = estimateRating(room._id);
          if (rating < minRating) return false;
        }

        return true;
      });
    }, [results, minPrice, maxPrice, selectedAmenities, minRating]);

    return (
      <div
        className="min-h-[calc(100vh-140px)]"
        style={{ maxWidth: 1440, margin: "0 auto" }}
      >
        <SearchBar onSearch={handleSearch} loading={loading} />

        {/* Content */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Sidebar */}
          <aside>
            <FilterSidebar
              minPrice={minPrice}
              maxPrice={maxPrice}
              onPriceChange={(min, max) => {
                setMinPrice(min);
                setMaxPrice(max);
              }}
              selectedAmenities={selectedAmenities}
              onAmenitiesChange={(values) => setSelectedAmenities(values as AmenityKey[])}
              minRating={minRating}
              onMinRatingChange={setMinRating}
            />
          </aside>

          {/* Main grid */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-black/60">
                {loading ? "Đang tải kết quả..." : `${filteredResults.length} phòng phù hợp`}
              </p>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredResults.map((item) => {
                const images = item.room.images || [];
                const hero = images[0] ? toImageUrl(images[0]) : "";
                const total =
                  searchParams != null
                    ? calculatePrice(
                        searchParams.checkIn,
                        searchParams.checkOut,
                        item.totalPrice
                      )
                    : item.totalPrice;
                return (
                  <RoomCard
                    key={item.room._id}
                    image={hero}
                    roomType={`${item.room.roomType?.name} · #${item.room.roomNumber}`}
                    totalPrice={total}
                    capacity={item.room.capacity}
                    onBook={() =>
                      navigate("/my-bookings", {
                        state: {
                          room: item.room,
                          total,
                          checkIn: searchParams?.checkIn,
                          checkOut: searchParams?.checkOut
                        }
                      })
                    }
                    onViewDetails={() => navigate(`/roomdetail/${item.room._id}`)}
                  />
                );
              })}
            </div>

            {!loading && filteredResults.length === 0 && !error && (
              <div className="mt-6 bg-[#F7F2EA] border border-black/5 rounded-2xl p-6 text-sm text-black/60">
                Không tìm thấy phòng phù hợp. Hãy thử thay đổi ngày, số khách hoặc bộ lọc.
              </div>
            )}
          </section>
        </div>

        {/* Image lightbox */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={() => setSelectedImage(null)}
          >
            <div className="max-w-5xl max-h-[86vh] px-4">
              <img
                src={toImageUrl(selectedImage)}
                alt="Ảnh phòng"
                className="w-full h-full object-contain rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  export default RoomsPage;
