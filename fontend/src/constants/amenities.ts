import { Wifi, Waves, Coffee, Dumbbell, Tv, Wind } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const AMENITY_MAP: Record<string, { id: string; icon: LucideIcon; label: string }> = {
  wifi: { id: 'wifi', icon: Wifi, label: 'Wi-Fi' },
  pool: { id: 'pool', icon: Waves, label: 'Hồ bơi' },
  breakfast: { id: 'breakfast', icon: Coffee, label: 'Bữa sáng' },
  gym: { id: 'gym', icon: Dumbbell, label: 'Phòng Gym' },
  tv: { id: 'tv', icon: Tv, label: 'Smart TV' },
  ac: { id: 'ac', icon: Wind, label: 'Điều hòa' },
  coffee: { id: 'coffee', icon: Coffee, label: 'Cà phê' },
};

export const amenityCatalog = Object.values(AMENITY_MAP).map(({ id, label }) => ({ key: id, label }));

export type AmenityKey = keyof typeof AMENITY_MAP;