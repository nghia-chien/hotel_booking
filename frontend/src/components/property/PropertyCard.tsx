import { useTranslation } from '../../../node_modules/react-i18next';
import { Heart, MapPin } from 'lucide-react';
import type { PropertyCardProps } from '../../types/property';
import { Badge, PropertyAmenityIcon, StarRating } from '../ui';
import { cn } from '../ui/utils';
import { toImageUrl } from '../../utils/format';

export default function PropertyCard({
  id,
  image,
  name,
  location,
  pricePerNight,
  totalPrice,
  priceLabel,
  rating,
  amenities,
  isFavorited,
  variant = 'default',
  onViewDetails,
  onBook,
  onFavorite,
  className,
}: PropertyCardProps) {
  const { t } = useTranslation();

  const isFeatured = variant === 'featured';
  const isCompact = variant === 'compact';

  const displayPrice = pricePerNight ?? totalPrice ?? 0;
  const displayLabel = priceLabel ?? (pricePerNight != null ? t('propertyCard.perNight') : t('propertyCard.totalPrice'));

  return (
    <article
      className={cn(
        'group relative rounded-2xl overflow-hidden bg-white cursor-pointer transition-all duration-300',
        'shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)]',
        isFeatured && 'ring-2 ring-[var(--color-primary)]/30',
        className
      )}
      onClick={() => onViewDetails?.()}
    >
      {/* IMAGE BLOCK */}
      <div
        className={cn(
          'relative overflow-hidden bg-gray-100',
          isCompact ? 'aspect-[3/2]' : 'aspect-[4/3]'
        )}
      >
        <img
          src={toImageUrl(image)}
          alt={name}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />

        {isFeatured && (
          <Badge variant="primary" size="sm" className="absolute top-3 left-3">
            {t('propertyCard.featured')}
          </Badge>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite?.(id);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:scale-110 transition-transform duration-200"
        >
          <Heart
            className={cn('w-4 h-4', isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-500')}
          />
        </button>
      </div>

      {/* BODY */}
      <div className={cn(isCompact ? 'p-3 space-y-1.5' : 'p-4 space-y-2')}>
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-[var(--color-text-muted)] flex-shrink-0" />
          <span className="text-xs text-[var(--color-text-muted)] truncate">{location}</span>
        </div>

        <h3
          className={cn(
            'font-semibold text-[var(--color-text-primary)] line-clamp-1',
            isCompact ? 'text-xs' : 'text-sm'
          )}
        >
          {name}
        </h3>

        {amenities && amenities.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {amenities.slice(0, 3).map((a) => (
              <PropertyAmenityIcon key={a} amenityId={a} size="sm" />
            ))}
          </div>
        )}

        {/* FOOTER */}
        <div className="flex items-end justify-between pt-3 border-t border-gray-50">
          <div>
            <span
              className={cn('font-bold text-[var(--color-text-primary)]', isCompact ? 'text-base' : 'text-lg')}
            >
              ${displayPrice.toFixed(0)}
            </span>
            <span className="text-xs text-[var(--color-text-muted)] ml-0.5">{displayLabel}</span>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StarRating rating={rating ?? 0} size="sm" showValue />
            {onBook && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBook();
                }}
                className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                {t('propertyCard.bookNow')}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}