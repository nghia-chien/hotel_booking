import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Users, Sparkles, Heart, ArrowRight } from 'lucide-react';
import type { PropertyCardProps } from '../../types/property';
import { PropertyAmenityIcon, StarRating } from '../ui';
import { cn } from '../ui/utils';
import { toImageUrl } from '../../utils/format';

export default function PropertyCard({
  id: _id,
  image,
  roomNumber,
  roomType,
  pricePerNight,
  totalPrice,
  priceLabel,
  capacity,
  rating,
  amenities,
  variant = 'default',
  onViewDetails,
  onBook,
  onAddToCart,
  className,
}: PropertyCardProps) {
  const { t } = useTranslation();
  const [isLiked, setIsLiked] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isFeatured = variant === 'featured';
  const isCompact = variant === 'compact';

  const displayPrice = totalPrice ?? pricePerNight ?? 0;
  const displayLabel = priceLabel ?? (pricePerNight != null ? t('propertyCard.perNight', '/đêm') : t('propertyCard.totalPrice', 'tổng cộng'));

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-2xl overflow-hidden bg-white cursor-pointer transition-all duration-300',
        'border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1',
        isFeatured && 'ring-2 ring-amber-400/40 shadow-amber-100/50',
        className
      )}
      onClick={() => onViewDetails?.()}
    >
      {/* IMAGE CONTAINER */}
      <div
        className={cn(
          'relative overflow-hidden bg-slate-100',
          isCompact ? 'aspect-[16/10]' : 'aspect-[4/3]'
        )}
      >
        <img
          src={!imgError && image ? toImageUrl(image) : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
          alt={`Phòng ${roomNumber}`}
          onError={() => setImgError(true)}
          className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-108"
        />

        {/* Subtle Dark Gradient Overlay at Bottom of Image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 opacity-70 group-hover:opacity-80 transition-opacity" />

        {/* TOP BADGES */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {isFeatured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-400 text-slate-900 shadow-md">
                <Sparkles className="w-3 h-3 fill-slate-900" />
                {t('propertyCard.featured', 'Nổi bật')}
              </span>
            )}
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 backdrop-blur-md text-slate-800 shadow-sm">
              {roomType || 'Phòng cao cấp'}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-600 hover:text-rose-500 hover:bg-white transition-all shadow-sm pointer-events-auto active:scale-90"
            title="Yêu thích"
          >
            <Heart className={cn('w-4 h-4 transition-colors', isLiked && 'fill-rose-500 text-rose-500')} />
          </button>
        </div>

        {/* BOTTOM IMAGE INFO: CAPACITY & RATING */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-white text-xs font-medium pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-md text-white/90 text-[11px]">
            <Users className="w-3 h-3" />
            {capacity ? `${capacity} khách` : '2 khách'}
          </span>

          <div className="pointer-events-auto">
            <StarRating rating={rating ?? 4.8} size="sm" showValue />
          </div>
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className={cn('flex flex-col flex-1', isCompact ? 'p-3.5 space-y-2' : 'p-4 space-y-3')}>
        {/* ROOM TITLE */}
        <div>
          <h3
            className={cn(
              'font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1',
              isCompact ? 'text-sm' : 'text-base'
            )}
          >
            {t('propertyCard.roomnumber', 'Phòng')} {roomNumber}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
            Không gian sang trọng & tiện nghi cao cấp
          </p>
        </div>

        {/* AMENITIES */}
        {amenities && amenities.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {amenities.slice(0, 3).map((a) => (
              <PropertyAmenityIcon key={a} amenityId={a} size="sm" />
            ))}
            {amenities.length > 3 && (
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">
                +{amenities.length - 3} tiện ích
              </span>
            )}
          </div>
        )}

        {/* FOOTER: PRICE & ACTIONS */}
        <div className="flex items-center justify-between pt-3 mt-auto border-t border-slate-100">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-slate-400 font-medium">$</span>
              <span className={cn('font-extrabold text-slate-900 tracking-tight', isCompact ? 'text-lg' : 'text-xl')}>
                {displayPrice.toFixed(0)}
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                {displayLabel}
              </span>
            </div>
            {totalPrice && pricePerNight && (
              <span className="text-[10px] text-slate-400">
                ${pricePerNight.toFixed(0)} / đêm
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {onAddToCart && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart();
                }}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer shadow-2xs"
                title={t('propertyCard.addToCart', 'Thêm vào giỏ')}
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            )}

            {onBook && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onBook();
                }}
                className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 active:scale-95 transition-all cursor-pointer shadow-sm hover:shadow"
              >
                <span>{t('propertyCard.bookNow', 'Đặt ngay')}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}