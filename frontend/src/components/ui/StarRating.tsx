import { Star } from 'lucide-react';
import { cn } from './utils';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

const sizeMapping = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function StarRating({
  rating,
  maxStars = 5,
  size = 'md',
  showValue = false,
  className,
}: StarRatingProps) {
  const filledCount = Math.floor(Math.min(rating, maxStars));
  const hasPartial = rating % 1 > 0 && rating < maxStars;
  const emptyCount = Math.max(0, maxStars - Math.ceil(rating));

  const starSize = sizeMapping[size];

  return (
    <div className={cn('inline-flex items-center gap-0.5', className)}>
      {[...Array(filledCount)].map((_, i) => (
        <Star key={`filled-${i}`} className={cn(starSize, 'fill-yellow-400 text-yellow-400')} />
      ))}
      {hasPartial && (
        <Star className={cn(starSize, 'fill-yellow-400 text-yellow-400 opacity-50')} />
      )}
      {[...Array(emptyCount)].map((_, i) => (
        <Star key={`empty-${i}`} className={cn(starSize, 'fill-gray-200 text-gray-200')} />
      ))}
      {showValue && (
        <span className="text-xs font-medium ml-1 text-[var(--color-text-secondary)]">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

export default StarRating;
