import { Search, Sparkles } from 'lucide-react';
import type { PropertyGridProps } from '../../types/property';
import PropertyCard from './PropertyCard';
import { cn } from '../ui/utils';

const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm animate-pulse flex flex-col">
    <div className="aspect-[4/3] bg-slate-200 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
    </div>
    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded-full w-2/3" />
        <div className="h-3 bg-slate-100 rounded-full w-1/2" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 bg-slate-100 rounded-md w-16" />
        <div className="h-5 bg-slate-100 rounded-md w-16" />
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-slate-100">
        <div className="h-6 bg-slate-200 rounded-md w-20" />
        <div className="h-8 bg-slate-200 rounded-xl w-24" />
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
    'grid grid-cols-1 md:grid-cols-2 gap-6',
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
      <div className="col-span-full py-16 px-6 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-4 text-amber-600 shadow-inner">
          <Search className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">
          Không tìm thấy phòng phù hợp
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          {emptyMessage ?? 'Thử thay đổi ngày nhận/trả phòng, khoảng giá hoặc bỏ bớt các tiêu chí lọc tiện nghi để tìm được nhiều phòng hơn.'}
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Gợi ý: Mở rộng khoảng giá hoặc chọn tất cả tiện ích
        </div>
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
