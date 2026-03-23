import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PropertyGrid, CategoryFilterTabs } from '../../components/property';
import { toImageUrl } from '../../utils/format';
import useAllRooms from '../../hooks/useAllRooms';
import { useAuth } from '../../context/AuthContext';
import type { PropertyCardProps } from '../../types/property';

export default function FeaturedSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { rooms, roomTypes, loading, error } = useAllRooms();
  const [activeTypeId, setActiveTypeId] = useState<string>('all');

  const tabs = useMemo(() => [
    { id: 'all', label: 'Tất cả' },
    ...roomTypes.map(rt => ({ id: rt._id, label: rt.name }))
  ], [roomTypes]);

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
        // Để đặt nhanh từ trang chủ, ta tạm định nghĩa ngày đặt là đêm nay
        // Hoặc chỉ redirect đến trang detail để chọn ngày.
        // Ở đây ta redirect đến detail để user chọn ngày cụ thể vì FeaturedSection không có date picker.
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
        <p className="text-red-500 mb-4">Lỗi: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[var(--color-primary-foreground)] text-white rounded-lg"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <section className="py-16 bg-[var(--color-surface)]">
      <div className="max-w-7xl mx-auto px-4">
        <header className="flex items-start justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
              Khám phá
            </p>
            <h2 className="font-serif text-3xl font-bold text-[var(--color-text-primary)]">
              Thoải mái đến từng chi tiết
            </h2>
            <p className="text-[var(--color-text-secondary)] text-sm mt-2">
              Những lựa chọn được tuyển chọn kỹ lưỡng.
            </p>
          </div>
          <Link
            to="/rooms"
            className="text-sm font-semibold text-[var(--color-text-primary)] hover:underline underline-offset-2"
          >
            Xem tất cả →
          </Link>
        </header>

        <CategoryFilterTabs
          categories={tabs}
          active={activeTypeId}
          onChange={setActiveTypeId}
          className="mb-8"
        />

        <PropertyGrid
          items={filteredItems}
          loading={loading}
          columns={5}
          emptyMessage="Hiện chưa có phòng nào."
        />
      </div>
    </section>
  );
}
