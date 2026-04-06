// ── Property UI Types ──
// Tách biệt với types/room.ts (domain model)
// File này chứa types dùng cho UI components

export type PropertyCategory =
  | 'all'
  | 'apartment'
  | 'resort'
  | 'lodge'
  | 'hotel'

// Props cho PropertyCard component
export interface PropertyCardProps {
  id: string
  image: string
  name: string
  location: string
  pricePerNight: number
  capacity: number
  rating?: number
  reviewCount?: number
  amenities?: string[]
  category?: PropertyCategory
  isFavorited?: boolean
  onBook?: () => void
  onAddToCart?: () => void
  onViewDetails?: () => void
  onFavorite?: (id: string) => void
  totalPrice?: number
  priceLabel?: string
  variant?: 'default' | 'featured' | 'compact'
  className?: string
}

// Props cho PropertyGrid component
export interface PropertyGridProps {
  items: PropertyCardProps[]
  loading?: boolean
  emptyMessage?: string
  columns?: 2 | 3 | 4 | 5
  className?: string
}

// Props cho CategoryFilterTabs component
export interface CategoryFilterProps {
  categories?: Array<{ id: string; label: string }>
  active: string
  onChange: (id: string) => void
  className?: string
}

// Params gửi lên API khi search
export interface PropertySearchParams {
  checkIn?: Date
  checkOut?: Date
  guests: number
}

// Testimonial data shape
export interface Testimonial {
  id: string
  quote: string
  author: string
  location: string
  rating: number
  avatar: string
}
