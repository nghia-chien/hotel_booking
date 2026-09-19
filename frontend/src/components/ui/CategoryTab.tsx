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
      type="button"
      onClick={onClick}
      className={cn(
        'px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap border flex items-center gap-1.5 shadow-2xs',
        active
          ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10 scale-102'
          : 'bg-white border-slate-200/80 text-slate-600 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50',
        className
      )}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            'text-xs px-1.5 py-0.5 rounded-full font-bold',
            active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export default CategoryTab;
