import { useTranslation } from '../../node_modules/react-i18next';
import { Star } from "lucide-react";
import { Slider } from "./ui/slider";
import { Checkbox } from "./ui/checkbox";
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
}

export function FilterSidebar({
  minPrice,
  maxPrice,
  onPriceChange,
  selectedAmenities,
  onAmenitiesChange,
  minRating,
  onMinRatingChange,
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

  return (
    <div className="bg-white rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-[var(--color-border)] sticky top-8">
      <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-6 border-b border-[var(--color-border)] pb-4">
        {t('filterSidebar.title')}
      </h2>

      {/* Price Range */}
      <div className="mb-8 border-b border-[var(--color-border)] pb-8">
        <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] block mb-4">
          {t('filterSidebar.priceRange')}
        </label>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            {t('filterSidebar.priceLabel')}
          </span>
          <span className="text-sm font-semibold text-[var(--color-text-secondary)]">
            ${minPrice} - ${maxPrice}
          </span>
        </div>
        <Slider
          value={[minPrice, maxPrice]}
          onValueChange={handlePriceChange}
          min={50}
          max={3000}
          step={50}
          className="mb-2"
        />
        <div className="flex justify-between text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-tighter">
          <span>$50</span>
          <span>$3000</span>
        </div>
      </div>

      {/* Amenities */}
      <div className="mb-8 border-b border-[var(--color-border)] pb-8">
        <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] block mb-4">
          {t('filterSidebar.amenities')}
        </label>
        <div className="space-y-3">
          {amenities.map((amenity) => {
            const Icon = amenity.icon;
            return (
              <div key={amenity.id} className="flex items-center gap-3 group">
                <Checkbox
                  id={amenity.id}
                  checked={selectedAmenities.includes(amenity.id)}
                  onCheckedChange={() => toggleAmenity(amenity.id)}
                />
                <label
                  htmlFor={amenity.id}
                  className="flex items-center gap-2 text-sm text-[var(--color-text-primary)] cursor-pointer group-hover:text-[var(--color-text-secondary)] transition-colors"
                >
                  <Icon className="h-4 w-4 text-[var(--color-text-secondary)]" />
                  {t(amenity.labelKey)}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guest Ratings */}
      <div>
        <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] block mb-4">
          {t('filterSidebar.rating')}
        </label>
        <div className="space-y-2">
          {ratings.map((rating) => (
            <button
              key={rating}
              onClick={() => onMinRatingChange(minRating === rating ? 0 : rating)}
              className={cn(
                'w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all cursor-pointer',
                minRating === rating
                  ? 'bg-[var(--color-primary-foreground)] text-white border-transparent'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-gray-400 hover:bg-gray-50'
              )}
            >
              <Star
                className={cn(
                  'h-3.5 w-3.5',
                  minRating === rating ? 'fill-white' : 'fill-yellow-400'
                )}
              />
              <span className="text-sm font-medium">
                {t('filterSidebar.stars', { count: rating })}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}