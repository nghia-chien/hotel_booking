import { useTranslation } from "../../node_modules/react-i18next";
import { Calendar, Users, Moon, MapPin, Trash2, AlertTriangle } from "lucide-react";
import { cn } from "./ui/utils";
import { toImageUrl } from "../utils/format";
import { format } from "date-fns";

export interface BookingSummaryCardProps {
  /** Mode determine styles and actions */
  mode: "cart" | "bill";
  /** Data can be from cart (pre-booking) or history (actual booking) */
  data: {
    _id?: string; // booking id if in bill mode
    roomId?: string; // room id if in cart mode
    roomNumber: string;
    roomTypeName: string;
    image?: string;
    checkIn: string | Date;
    checkOut: string | Date;
    guests: number;
    capacity: number;
    totalPrice: number;
    status?: string; // for bill mode
  };
  conflict?: boolean; // for cart mode
  onRemove?: (id: string) => void;
  onClick?: (id: string) => void;
}

const statusColors: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800 border-amber-200",
  Confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  CheckedIn: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CheckedOut: "bg-gray-100 text-gray-800 border-gray-200",
  Cancelled: "bg-red-100 text-red-800 border-red-200",
};

export default function BookingSummaryCard({
  mode,
  data,
  conflict = false,
  onRemove,
  onClick,
}: BookingSummaryCardProps) {
  const { t } = useTranslation();
  const isCart = mode === "cart";
  
  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);
  const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)));

  const cardId = isCart ? data.roomId : data._id;

  return (
    <div
      className={cn(
        "border rounded-2xl bg-white overflow-hidden shadow-sm transition-all duration-200",
        isCart && conflict ? "border-red-300 ring-1 ring-red-300" : "border-gray-200",
        !isCart && "border-gray-200"
      )}
    >
      <div className="flex flex-col sm:flex-row">
        {/* FIXED IMAGE */}
        <div
          className="relative sm:w-48 flex-shrink-0 bg-gray-100 cursor-pointer overflow-hidden"
          style={{ height: "160px" }}
          onClick={() => onClick?.(cardId!)}
        >
          {data.image ? (
            <img
              src={toImageUrl(data.image)}
              alt={data.roomTypeName}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
          )}

          {/* Status badge overlay for bill mode */}
          {!isCart && data.status && (
            <span className={cn(
              "absolute top-2 left-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border",
              statusColors[data.status] || statusColors.Pending
            )}>
              {t(`statusBadge.${data.status}`, data.status)}
            </span>
          )}

          {/* Conflict overlay for cart mode */}
          {isCart && conflict && (
            <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center flex-col gap-1 text-white text-center p-2">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-wider">Hết phòng</p>
            </div>
          )}
        </div>

        {/* DETAILS */}
        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          <div>
            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4
                  className="font-bold text-gray-900 text-base leading-tight truncate cursor-pointer hover:text-indigo-700 transition-colors"
                  onClick={() => onClick?.(cardId!)}
                >
                  {data.roomTypeName}
                </h4>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[var(--color-primary)]" />
                  Phòng {data.roomNumber}
                </p>
              </div>

              {isCart && onRemove && (
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(cardId!); }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title={t('cart.removeItem', 'Xóa')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gray-50">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">Check-in</p>
                  <p className="font-semibold text-gray-800 text-xs">{format(checkIn, "dd/MM/yyyy")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gray-50">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">Check-out</p>
                  <p className="font-semibold text-gray-800 text-xs">{format(checkOut, "dd/MM/yyyy")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gray-50">
                  <Moon className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">{t('bookingDetail.nights', 'Đêm')}</p>
                  <p className="font-semibold text-gray-800 text-xs">{nights} đêm</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gray-50">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">{t('bookingDetail.guests', 'Khách')}</p>
                  <p className="font-semibold text-gray-800 text-xs">{data.guests}/{data.capacity}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer: price + block status */}
          <div className="flex items-end justify-between mt-4 pt-4 border-t border-gray-50">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-0.5">{t('bookingDetail.totalPrice', 'Tổng cộng')}</p>
              <p className="text-xl font-bold text-gray-900">${data.totalPrice.toLocaleString("en-US")}</p>
            </div>

            {isCart && (
              <div className="text-right">
                {conflict ? (
                  <p className="text-xs text-red-600 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Không khả dụng
                  </p>
                ) : (
                  <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest animate-pulse">
                    Chờ thanh toán để giữ phòng
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
