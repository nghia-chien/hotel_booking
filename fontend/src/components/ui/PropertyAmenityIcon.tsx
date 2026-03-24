import { Wifi, Waves, Coffee, Car, Dumbbell, Tv, Wind, Star } from 'lucide-react';
import { cn } from './utils';

const AMENITY_MAP: Record<string, { icon: any; label: string }> = {
  wifi: { icon: Wifi, label: 'Wi-Fi' },
  pool: { icon: Waves, label: 'Hồ bơi' },
  breakfast: { icon: Coffee, label: 'Bữa sáng' },
  parking: { icon: Car, label: 'Bãi đỗ xe' },
  gym: { icon: Dumbbell, label: 'Gym' },
  tv: { icon: Tv, label: 'Smart TV' },
  ac: { icon: Wind, label: 'Điều hòa' },
  coffee: { icon: Coffee, label: 'Cà phê' },
};

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
