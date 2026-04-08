import { useTranslation } from "react-i18next";
import { cn } from "../ui/utils";

type BookingStatus =
  | "Paid"
  | "Pending"
  | "Expired"
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
  { bg: string; text: string; labelKey: string }
> = {
  Paid: { bg: "bg-emerald-50", text: "text-emerald-700", labelKey: "statusBadge.Paid" },
  Pending: { bg: "bg-amber-50", text: "text-amber-700", labelKey: "statusBadge.Pending" },
  Expired: { bg: "bg-orange-50", text: "text-orange-700", labelKey: "statusBadge.Expired" },
  Cancelled: { bg: "bg-red-50", text: "text-red-700", labelKey: "statusBadge.Cancelled" },
  CheckedIn: { bg: "bg-blue-50", text: "text-blue-700", labelKey: "statusBadge.CheckedIn" },
  CheckedOut: { bg: "bg-gray-50", text: "text-gray-700", labelKey: "statusBadge.CheckedOut" },
};

const FALLBACK = { bg: "bg-gray-50", text: "text-gray-700" };

export function StatusBadge({
  status,
  variant = "pill",
  className,
}: StatusBadgeProps) {
  const { t } = useTranslation();

  const config = STATUS_CONFIGS[status as BookingStatus];

  return (
    <span
      className={cn(
        "px-3 py-1 text-[10px] font-bold uppercase tracking-wider border border-transparent",
        variant === "pill" ? "rounded-full" : "rounded-lg",
        config ? config.bg : FALLBACK.bg,
        config ? config.text : FALLBACK.text,
        className
      )}
    >
      {config ? t(config.labelKey) : status}
    </span>
  );
}

export default StatusBadge;