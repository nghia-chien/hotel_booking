import { Wifi, Waves, Coffee, Dumbbell, Tv, Wind } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const AMENITY_MAP: Record<string, { id: string; icon: LucideIcon; labelKey: string }> = {
  wifi: { id: 'wifi', icon: Wifi, labelKey: 'amenities.wifi' },
  pool: { id: 'pool', icon: Waves, labelKey: 'amenities.pool' },
  breakfast: { id: 'breakfast', icon: Coffee, labelKey: 'amenities.breakfast' },
  gym: { id: 'gym', icon: Dumbbell, labelKey: 'amenities.gym' },
  tv: { id: 'tv', icon: Tv, labelKey: 'amenities.tv' },
  ac: { id: 'ac', icon: Wind, labelKey: 'amenities.ac' },
  coffee: { id: 'coffee', icon: Coffee, labelKey: 'amenities.coffee' },
};

export const amenityCatalog = Object.values(AMENITY_MAP).map(({ id, labelKey }) => ({ key: id, labelKey }));

export type AmenityKey = keyof typeof AMENITY_MAP;