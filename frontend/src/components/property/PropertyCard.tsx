import { useTranslation } from 'react-i18next';
import { ShoppingCart } from 'lucide-react';
import type { PropertyCardProps } from '../../types/property';
import { Badge, PropertyAmenityIcon, StarRating } from '../ui';
import { cn } from '../ui/utils';
import { toImageUrl } from '../../utils/format';

export default function PropertyCard({
  id: _id,
  image,
  roomNumber,
  roomType,
  // location,           thêm địa chỉ phòng sau này ( hà nội . hcm  ....)
  pricePerNight,
  totalPrice,
  priceLabel,
  rating,
  amenities,

  variant = 'default',
  onViewDetails,
  onBook,
  onAddToCart,
  className,
}: PropertyCardProps) {
  const { t } = useTranslation();

  const isFeatured = variant === 'featured';
  const isCompact = variant === 'compact';

  const displayPrice = totalPrice ?? pricePerNight ?? 0;
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
          alt={roomNumber}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />

        {isFeatured && (
          <Badge variant="primary" size="sm" className="absolute top-3 left-3">
            {t('propertyCard.featured')}
          </Badge>
        )}

      </div>

      {/* BODY */}
      <div className={cn(isCompact ? 'p-3 space-y-1.5' : 'p-4 space-y-2')}>
        <div className="flex items-center justify-between gap-2">
          <h3
            className={cn(
              'font-bold text-[var(--color-text-primary)] line-clamp-1',
              isCompact ? 'text-sm' : 'text-base'
            )}
          >
            {t('propertyCard.roomnumber')} {roomNumber}
          </h3>

          <span className="text-xs text-[var(--color-text-muted)] truncate shrink-0">
            {roomType}
          </span>
        </div>

        {/* Hàng 2: Amenities ở dưới */}
        {amenities && amenities.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {amenities.slice(0, 3).map((a) => (
              <PropertyAmenityIcon key={a} amenityId={a} size="sm" />
            ))}
            {amenities.length > 3 && (
              <span className="text-[10px] text-[var(--color-text-muted)]">
                +{amenities.length - 3}
              </span>
            )}
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
            <div className="flex items-center gap-1.5">
              {onAddToCart && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart();
                  }}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                  title={t('propertyCard.addToCart', 'Thêm vào giỏ')}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                </button>
              )}
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
      </div>
    </article>
  );
}