import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import { useTranslation } from "../../node_modules/react-i18next";
import { apiRequest } from "../api/client";
import { Button } from "../components/ui/button";
import RoomGallery from "../components/RoomGallery";
import { BookingCard } from "../components/BookingCard";

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
  avgRating?: number;
  totalReviews?: number;
}

interface Review {
  _id: string;
  user: { fullName: string };
  rating: number;
  comment: string;
  createdAt: string;
}

interface RoomResponse {
  success: boolean;
  data: Room;
}

const formatUSD = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);

export default function RoomDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

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
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      if (!id) return;
      try {
        setReviewsLoading(true);
        const res = await apiRequest<{ success: boolean; data: Review[] }>(
          `/api/reviews/room/${id}`,
          "GET"
        );
        setReviews(res.data);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setReviewsLoading(false);
      }
    };

    void fetchRoom();
    void fetchReviews();
  }, [id]);

  if (loading) {
    return <p>{t('roomDetail.loading')}</p>;
  }

  if (error || !room) {
    return (
      <div className="space-y-3">
        <Button variant="outline" className="rounded-xl" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('roomDetail.backBtn')}
        </Button>
        <p className="text-red-600 text-sm">{error ?? t('roomDetail.notFound')}</p>
      </div>
    );
  }

  const images = room.images || [];

  return (
    <div className="min-h-[calc(100vh-140px)]" style={{ maxWidth: 1440, margin: "0 auto" }}>
      {/* Header */}
      <header className="mb-6 flex items-center gap-3">
        <Button variant="outline" className="rounded-xl" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('roomDetail.backBtn')}
        </Button>
        <h1 className="text-xl md:text-2xl font-semibold text-[#2C2C2C]">
          {room.roomType?.name || t('roomDetail.roomType')}
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        {/* Left: images + description */}
        <div className="space-y-6">
          <RoomGallery images={images} roomNumber={room.roomNumber} />

          {/* Description */}
          <section className="bg-white border border-black/5 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-black/50">
                  {room.roomType?.name || t('roomDetail.roomType')}
                </p>
                <h2 className="text-2xl font-semibold text-[#1F1F1F]"> {t('roomDetail.roomnumber')} {room.roomNumber}</h2>
                <p className="text-sm text-black/60 mt-1">{t('roomDetail.capacity', { count: room.capacity })}</p>
              </div>
              <div className="flex items-center gap-1 text-sm text-black/60">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i <= (room.avgRating || 0) ? "fill-[#FFD700] text-[#FFD700]" : "text-gray-200"}`}
                  />
                ))}
                <span className="ml-1 text-xs font-bold text-gray-900">
                  {room.avgRating || 0}
                </span>
              <span className="text-xs text-gray-400">({room.totalReviews || 0} {t('header.reviews')})</span>
              </div>
            </div>

            {room.roomType?.description && (
              <p className="text-sm text-black/65">
                {room.roomType.description}
              </p>
            )}

            {room.policies && (
              <div className="pt-2 border-t border-black/5 mt-2">
              <h3 className="text-sm font-medium text-[#2C2C2C] mb-1">{t('roomDetail.policy')}</h3>
                <p className="text-sm text-black/60">{room.policies}</p>
              </div>
            )}

            {room.amenities && room.amenities.length > 0 && (
              <div className="pt-2 border-t border-black/5 mt-2">
              <h3 className="text-sm font-medium text-[#2C2C2C] mb-1">{t('roomDetail.amenities')}</h3>
                <p className="text-sm text-black/60">
                  {room.amenities.join(", ")}
                </p>
              </div>
            )}
          </section>

          {/* Reviews Section */}
          <section className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
            <h3 className="text-xl font-bold text-gray-900 italic">{t('roomDetail.reviews')}</h3>
              <div className="text-right">
                <div className="text-3xl font-black text-gray-900">{room.avgRating || 0}</div>
                <div className="flex gap-0.5 justify-end">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className={`w-3 h-3 ${i <= (room.avgRating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                  ))}
                </div>
              </div>
            </div>

            {reviewsLoading ? (
              <div className="py-10 text-center text-gray-400 text-sm">{t('roomDetail.loadingReviews')}</div>
            ) : reviews.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <p className="text-gray-400 font-medium">{t('roomDetail.noReviews')}</p>
                <p className="text-xs text-gray-300 italic">{t('roomDetail.noReviewsHint')}</p>
              </div>
            ) : (
              <div className="space-y-8">
                {reviews.map((rev) => (
                  <div key={rev._id} className="group">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-lg shadow-inner uppercase">
                        {rev.user.fullName.substring(0, 2)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-900">{rev.user.fullName}</h4>
                          <span className="text-xs text-gray-400">{new Date(rev.createdAt).toLocaleDateString("vi-VN")}</span>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} className={`w-3 h-3 ${i <= rev.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                          ))}
                        </div>
                        <p className="text-gray-600 text-sm mt-3 leading-relaxed bg-gray-50/50 p-4 rounded-xl border border-transparent group-hover:border-gray-100 transition-all">
                          {rev.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <BookingCard roomId={room._id} capacity={room.capacity} />
          <div className="bg-white border border-black/5 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-lg font-semibold text-[#1F1F1F]">{t('roomDetail.basePrice')}</h3>
            <p className="text-2xl font-semibold text-[#2B2B2B]">
              {room.roomType?.basePrice != null ? formatUSD(room.roomType.basePrice) : t('roomDetail.contact')}
              {room.roomType?.basePrice != null && (
                <span className="text-xs text-black/50 ml-1">{t('roomDetail.perNight')}</span>
              )}
            </p>
            <p className="text-xs text-black/50">{t('roomDetail.actualPrice')}</p>
          </div>
          <Button
            variant="outline"
            className="w-full rounded-xl border-[#E8DFD8] bg-white hover:bg-[#F5F1ED]"
            onClick={() => navigate("/rooms")}>
            {t('roomDetail.backToSearch')}
          </Button>
        </aside>
      </div>
    </div>
  );
}
