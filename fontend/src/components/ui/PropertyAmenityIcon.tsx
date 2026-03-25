import { Star } from 'lucide-react';
import { cn } from './utils';
import { AMENITY_MAP } from '../../constants/amenities';

interface PropertyAmenityIconProps {
  amenityId: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const sizeMapping = {
  sm: { icon: 'w-3.5 h-3.5', text: 'text-[10px]' },
  md: { icon: 'w-4 h-4', text: 'text-xs' },
};

export function PropertyAmenityIcon({
  amenityId,
  showLabel = false,
  size = 'sm',
  className,
}: PropertyAmenityIconProps) {
  const amenity = AMENITY_MAP[amenityId] || { icon: Star, label: amenityId };
  const Icon = amenity.icon;
  const styles = sizeMapping[size];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[var(--color-text-secondary)]',
        className
      )}
    >
      <Icon className={styles.icon} />
      {showLabel && <span className={styles.text}>{amenity.label}</span>}
    </span>
  );
}

export default PropertyAmenityIcon;
