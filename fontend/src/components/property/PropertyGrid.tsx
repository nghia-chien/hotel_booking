import { Search } from 'lucide-react';
import type { PropertyGridProps } from '../../types/property';
import PropertyCard from './PropertyCard';
import { cn } from '../ui/utils';

const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden bg-white animate-pulse shadow-[var(--shadow-sm)]">
    <div className="aspect-[4/3] bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-gray-200 rounded-full w-1/2" />
      <div className="h-4 bg-gray-200 rounded-full w-3/4" />
      <div className="h-3 bg-gray-200 rounded-full w-1/3" />
      <div className="flex justify-between mt-2 pt-3 border-t border-gray-100">
        <div className="h-5 bg-gray-200 rounded-full w-1/4" />
        <div className="h-4 bg-gray-200 rounded-full w-1/4" />
      </div>
    </div>
  </div>
);

export default function PropertyGrid({
  items,
  loading = false,
  emptyMessage,
  columns = 3,
  className,
}: PropertyGridProps) {
  const gridClasses = cn(
    'grid grid-cols-1 md:grid-cols-2 gap-5',
    columns === 3 && 'lg:grid-cols-3',
    columns === 4 && 'lg:grid-cols-3 xl:grid-cols-4',
    columns === 5 && 'lg:grid-cols-3 xl:grid-cols-5',
    className
  );

  if (loading) {
    return (
      <div className={gridClasses}>
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={`skeleton-${i}`} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="col-span-full py-20 text-center">
        <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="font-medium text-[var(--color-text-secondary)]">
          {emptyMessage ?? 'Không tìm thấy phòng phù hợp.'}
        </p>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Thử thay đổi ngày, số khách hoặc bộ lọc.
        </p>
      </div>
    );
  }

  return (
    <div className={gridClasses}>
      {items.map((item) => (
        <PropertyCard key={item.id} {...item} />
      ))}
    </div>
  );
}
