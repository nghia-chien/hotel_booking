import { useState, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PropertyCard, CategoryFilterTabs } from '../../components/property';
import { toImageUrl } from '../../utils/format';
import useAllRooms from '../../hooks/useAllRooms';
import { useAuth } from '../../context/AuthContext';
import type { PropertyCardProps } from '../../types/property';
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight, RefreshCw, Hotel } from 'lucide-react';

export default function FeaturedSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { rooms, roomTypes, loading, error } = useAllRooms();
  const [activeTypeId, setActiveTypeId] = useState<string>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const tabs = useMemo(() => [
    { id: 'all', label: t('featured.all', 'Tất cả') },
    ...roomTypes.map(rt => ({ id: rt._id, label: rt.name }))
  ], [roomTypes, t]);

  const propertyItems: PropertyCardProps[] = useMemo(() => {
    return rooms.map((room) => ({
      id: room._id,
      image: toImageUrl(room.images?.[0] ?? ''),
      roomNumber: room.roomNumber ?? 'Phòng',
      roomType: room.roomType?.name ?? 'Khách sạn',
      pricePerNight: room.roomType?.basePrice ?? 0,
      capacity: room.capacity,
      rating: (room as any).avgRating ?? 4.8,
      amenities: room.amenities ?? [],
      variant: 'default',
      onViewDetails: () => navigate(`/roomdetail/${room._id}`),
      onBook: async () => {
        if (!user) {
          navigate("/login", { state: { from: { pathname: window.location.pathname } } });
          return;
        }
        navigate(`/roomdetail/${room._id}`);
      }
    }));
  }, [rooms, navigate, user]);

  const filteredItems = useMemo(() => {
    if (activeTypeId === 'all') return propertyItems;
    return propertyItems.filter(
      (item) => {
        const room = rooms.find(r => r._id === item.id);
        return room?.roomType?._id === activeTypeId;
      }
    );
  }, [propertyItems, activeTypeId, rooms]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  if (error) {
    return (
      <div className="py-20 text-center bg-white rounded-3xl mx-4 my-8 border border-slate-200">
        <p className="text-rose-500 font-semibold mb-4">{t('featured.error', 'Lỗi: ')}{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          {t('featured.retry', 'Thử lại')}
        </button>
      </div>
    );
  }

  return (
    <section className="py-20 bg-slate-50/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* SECTION HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('featured.badge', 'Bộ sưu tập thượng lưu')}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              {t('featured.title', 'Sự thoải mái trong từng chi tiết')}
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-xl">
              {t('featured.subtitle', 'Tuyển chọn những không gian nghỉ dưỡng danh giá, sở hữu tầm nhìn ngoạn mục và tiện nghi cao cấp.')}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Scroll Navigation Arrows */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={scrollLeft}
                className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-xs cursor-pointer active:scale-95"
                title="Trước"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={scrollRight}
                className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-xs cursor-pointer active:scale-95"
                title="Tiếp theo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <Link
              to="/rooms"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-xs group"
            >
              <span>{t('featured.viewAll', 'Xem tất cả phòng')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </header>

        {/* CATEGORY TABS */}
        <div className="mb-8">
          <CategoryFilterTabs
            categories={tabs}
            active={activeTypeId}
            onChange={setActiveTypeId}
          />
        </div>

        {/* ROOMS CONTENT */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-slate-100 p-4 animate-pulse space-y-3">
                <div className="aspect-[4/3] bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded-full w-3/4" />
                <div className="h-3 bg-slate-100 rounded-full w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Hotel className="w-6 h-6" />
            </div>
            <p className="text-slate-700 font-semibold">Hiện chưa có phòng nào trong danh mục này.</p>
            <p className="text-slate-400 text-xs mt-1">Vui lòng chọn danh mục khác hoặc quay lại sau.</p>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
            style={{
              scrollbarWidth: 'none',
            }}
          >
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="snap-start shrink-0 w-[280px] sm:w-[320px] lg:w-[340px]"
              >
                <PropertyCard {...item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
