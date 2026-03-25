import { cn } from "../ui/utils";

type BookingStatus =
  | "Confirmed"
  | "Pending"
  | "Cancelled"
  | "CheckedIn"
  | "CheckedOut";

interface StatusBadgeProps {
  status: string;
  /** "pill" = rounded-full (default), "tag" = rounded-lg */
  variant?: "pill" | "tag";
  className?: string;
}

const STATUS_CONFIGS: Record<
  BookingStatus,
  { bg: string; text: string; label: string }
> = {
  Confirmed:  { bg: "bg-emerald-50", text: "text-emerald-700", label: "Đã xác nhận" },
  Pending:    { bg: "bg-amber-50",   text: "text-amber-700",   label: "Chờ duyệt" },
  Cancelled:  { bg: "bg-red-50",     text: "text-red-700",     label: "Đã hủy" },
  CheckedIn:  { bg: "bg-blue-50",    text: "text-blue-700",    label: "Đã nhận phòng" },
  CheckedOut: { bg: "bg-gray-50",    text: "text-gray-700",    label: "Đã trả phòng" },
};

const FALLBACK = { bg: "bg-gray-50", text: "text-gray-700" };

export function StatusBadge({
  status,
  variant = "pill",
  className,
}: StatusBadgeProps) {
  const config = STATUS_CONFIGS[status as BookingStatus] ?? {
    ...FALLBACK,
    label: status,
  };
  return (
    <span
      className={cn(
        "px-3 py-1 text-[10px] font-bold uppercase tracking-wider border border-transparent",
        variant === "pill" ? "rounded-full" : "rounded-lg",
        config.bg,
        config.text,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export default StatusBadge;
