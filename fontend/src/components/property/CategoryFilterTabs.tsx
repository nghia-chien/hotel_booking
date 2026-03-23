import type { CategoryFilterProps } from '../../types/property';
import CategoryTab from '../ui/CategoryTab';
import { cn } from '../ui/utils';

const DEFAULT_CATEGORIES = [
  { id: 'all', label: 'Tất cả' },
];

export default function CategoryFilterTabs({
  categories,
  active,
  onChange,
  className,
}: CategoryFilterProps) {
  return (
    <div
      className={cn('flex gap-2 overflow-x-auto pb-1', className)}
      style={{ scrollbarWidth: 'none' }}
    >
      {(categories ?? DEFAULT_CATEGORIES).map((cat) => (
        <CategoryTab
          key={cat.id}
          label={cat.label}
          active={active === cat.id}
          onClick={() => onChange(cat.id)}
        />
      ))}
    </div>
  );
}
