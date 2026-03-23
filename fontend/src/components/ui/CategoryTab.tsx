import { cn } from './utils';

interface CategoryTabProps {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
  className?: string;
}

export function CategoryTab({
  label,
  active,
  onClick,
  count,
  className,
}: CategoryTabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap border',
        active
          ? 'bg-[var(--color-primary-foreground)] text-white border-transparent'
          : 'bg-white border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-gray-400 hover:text-[var(--color-text-primary)]',
        className
      )}
    >
      {label}
      {count !== undefined && <span className="text-[10px] ml-1 opacity-60">({count})</span>}
    </button>
  );
}

export default CategoryTab;
