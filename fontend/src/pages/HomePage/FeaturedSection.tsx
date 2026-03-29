import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PropertyCard, CategoryFilterTabs } from '../../components/property';
import { toImageUrl } from '../../utils/format';
import useAllRooms from '../../hooks/useAllRooms';
import { useAuth } from '../../context/AuthContext';
import type { PropertyCardProps } from '../../types/property';

export default function FeaturedSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { rooms, roomTypes, loading, error } = useAllRooms();
  const [activeTypeId, setActiveTypeId] = useState<string>('all');

  const tabs = useMemo(() => [
    { id: 'all', label: t('featured.all') },
    ...roomTypes.map(rt => ({ id: rt._id, label: rt.name }))
  ], [roomTypes, t]);

  const propertyItems: PropertyCardProps[] = useMemo(() => {
    return rooms.map((room) => ({
      id: room._id,
      image: toImageUrl(room.images?.[0] ?? ''),
      name: `${room.roomType?.name ?? 'Phòng'} #${room.roomNumber}`,
      location: room.roomType?.name ?? 'Khách sạn',
      pricePerNight: room.roomType?.basePrice ?? 0,
      capacity: room.capacity,
      rating: (room as any).avgRating ?? 4.5,
      amenities: room.amenities ?? [],
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

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-500 mb-4">{t('featured.error')}{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[var(--color-primary-foreground)] text-white rounded-lg">
          {t('featured.retry')}
        </button>
      </div>
    );
  }

  return (
    <section className="py-16 bg-[var(--color-surface)]">
      <div className="max-w-7xl mx-auto px-4">
        <header className="flex items-start justify-between mb-8">
          <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">{t('featured.badge')}</p>
            <h2 className="font-serif text-3xl font-bold text-[var(--color-text-primary)]">{t('featured.title')}</h2>
            <p className="text-[var(--color-text-secondary)] text-sm mt-2">{t('featured.subtitle')}</p>
          </div>
          <Link to="/rooms" className="text-sm font-semibold text-[var(--color-text-primary)] hover:underline underline-offset-2">
            {t('featured.viewAll')}
          </Link>
        </header>

        <CategoryFilterTabs
          categories={tabs}
          active={activeTypeId}
          onChange={setActiveTypeId}
          className="mb-8"
        />

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[var(--color-border)]">
            <p className="text-[var(--color-text-secondary)]">Hiện chưa có phòng nào.</p>
          </div>
        ) : (
          <div 
            className="grid grid-rows-2 grid-flow-col gap-6 overflow-x-auto pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{
              gridAutoColumns: "minmax(280px, calc((100% - 4 * 1.5rem) / 5))"
            }}
          >
            {filteredItems.map((item) => (
              <div key={item.id} className="snap-start w-full h-full flex">
                <div className="w-full">
                  <PropertyCard {...item} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
