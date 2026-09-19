import { useTranslation } from 'react-i18next';
import { Star, SlidersHorizontal, RotateCcw, Check } from "lucide-react";
import { Slider } from "./ui/slider";
import { cn } from "./ui/utils";
import { AMENITY_MAP } from "../constants/amenities";

interface FilterSidebarProps {
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
  selectedAmenities: string[];
  onAmenitiesChange: (values: string[]) => void;
  minRating: number;
  onMinRatingChange: (value: number) => void;
  onReset?: () => void;
}

export function FilterSidebar({
  minPrice,
  maxPrice,
  onPriceChange,
  selectedAmenities,
  onAmenitiesChange,
  minRating,
  onMinRatingChange,
  onReset,
}: FilterSidebarProps) {
  const { t } = useTranslation();

  const amenities = [
    AMENITY_MAP.wifi,
    AMENITY_MAP.tv,
    AMENITY_MAP.ac,
    AMENITY_MAP.coffee,
    AMENITY_MAP.pool,
    AMENITY_MAP.gym,
  ];

  const ratings = [5, 4, 3];

  const handlePriceChange = (values: number[]) => {
    if (values.length === 2) {
      onPriceChange(values[0], values[1]);
    }
  };

  const toggleAmenity = (id: string) => {
    onAmenitiesChange(
      selectedAmenities.includes(id)
        ? selectedAmenities.filter((a) => a !== id)
        : [...selectedAmenities, id]
    );
  };

  const isFiltered = minPrice > 0 || maxPrice < 1500 || selectedAmenities.length > 0 || minRating > 0;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 sticky top-24">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <SlidersHorizontal className="w-4 h-4 text-amber-500" />
          <span>{t('filterSidebar.title', 'Bộ lọc tìm kiếm')}</span>
        </div>

        {isFiltered && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Đặt lại</span>
          </button>
        )}
      </div>

      {/* PRICE RANGE */}
      <div className="mb-6 pb-6 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {t('filterSidebar.priceRange', 'Khoảng giá / đêm')}
          </label>
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/60">
            ${minPrice} - ${maxPrice}
          </span>
        </div>

        <Slider
          value={[minPrice, maxPrice]}
          onValueChange={handlePriceChange}
          min={0}
          max={1500}
          step={20}
          className="my-4"
        />

        <div className="flex justify-between text-[11px] font-medium text-slate-400">
          <span>$0 (Tối thiểu)</span>
          <span>$1,500+ (Cao cấp)</span>
        </div>
      </div>

      {/* AMENITIES */}
      <div className="mb-6 pb-6 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {t('filterSidebar.amenities', 'Tiện ích nghỉ dưỡng')}
          </label>
          {selectedAmenities.length > 0 && (
            <span className="text-[10px] font-bold text-slate-500">
              Đã chọn: {selectedAmenities.length}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2">
          {amenities.map((amenity) => {
            const Icon = amenity.icon;
            const isChecked = selectedAmenities.includes(amenity.id);
            return (
              <button
                key={amenity.id}
                type="button"
                onClick={() => toggleAmenity(amenity.id)}
                className={cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer text-left',
                  isChecked
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200/70 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn('w-4 h-4', isChecked ? 'text-amber-300' : 'text-slate-500')} />
                  <span>{t(amenity.labelKey, amenity.id)}</span>
                </div>
                {isChecked && <Check className="w-3.5 h-3.5 text-amber-300" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* GUEST RATINGS */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
          {t('filterSidebar.rating', 'Đánh giá tối thiểu')}
        </label>
        <div className="space-y-2">
          {ratings.map((rating) => {
            const isSelected = minRating === rating;
            return (
              <button
                key={rating}
                type="button"
                onClick={() => onMinRatingChange(isSelected ? 0 : rating)}
                className={cn(
                  'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
                  isSelected
                    ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-xs font-bold'
                    : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        className={cn(
                          'w-3.5 h-3.5',
                          idx < rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-slate-200 text-slate-200'
                        )}
                      />
                    ))}
                  </div>
                  <span>{rating} sao trở lên</span>
                </div>
                {isSelected && (
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                    Chọn
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}