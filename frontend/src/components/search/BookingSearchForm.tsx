import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format, addDays, differenceInCalendarDays } from 'date-fns';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Users,
  Search,
  Loader2,
  Moon,
  Plus,
  Minus,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import type { PropertySearchParams } from '../../types/property';

interface BookingSearchFormProps {
  onSearch: (params: PropertySearchParams) => void;
  loading?: boolean;
  variant?: 'hero' | 'compact' | 'page';
  className?: string;
}

export default function BookingSearchForm({
  onSearch,
  loading = false,
  variant = 'hero',
  className,
}: BookingSearchFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [guests, setGuests] = useState(2);

  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);

  const isHero = variant === 'hero';
  const isPage = variant === 'page';

  const nights = checkIn && checkOut ? Math.max(1, differenceInCalendarDays(checkOut, checkIn)) : 0;

  const handleSearch = () => {
    if (!checkIn || !checkOut) return;

    if (location.pathname === '/') {
      const params = new URLSearchParams();
      params.set('checkIn', checkIn.toISOString());
      params.set('checkOut', checkOut.toISOString());
      params.set('guests', guests.toString());
      navigate(`/rooms?${params.toString()}`);
    } else {
      onSearch({ checkIn, checkOut, guests });
    }
  };

  return (
    <div
      className={cn(
        'transition-all duration-300',
        isHero
          ? 'bg-white/95 backdrop-blur-xl rounded-3xl p-3 shadow-2xl shadow-black/20 border border-white/40'
          : isPage
          ? 'bg-white rounded-2xl border border-slate-200/80 shadow-md p-3'
          : 'bg-white rounded-xl p-2 flex gap-2 items-center border border-slate-200',
        className
      )}
    >
      <div
        className={cn(
          'w-full',
          isHero
            ? 'grid grid-cols-1 md:grid-cols-[1.1fr_1.1fr_1fr_auto] gap-2 md:gap-0 md:divide-x divide-slate-100'
            : isPage
            ? 'grid grid-cols-1 md:grid-cols-[1.1fr_1.1fr_1fr_auto] gap-3'
            : 'flex gap-2 items-center'
        )}
      >
        {/* FIELD 1: Check-in */}
        <div
          className={cn(
            'group transition-colors rounded-2xl',
            isHero ? 'px-5 py-3 hover:bg-slate-50/80 cursor-pointer' : isPage ? 'border border-slate-200 rounded-xl px-4 py-3 bg-white hover:border-slate-300' : 'px-2 py-1',
            checkInOpen && 'bg-slate-50/80'
          )}
        >
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            {t('bookingSearch.checkInLabel', 'Nhận phòng')}
          </label>
          <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 text-left w-full cursor-pointer group-hover:text-slate-900 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span
                    className={cn(
                      'text-sm font-semibold truncate',
                      checkIn ? 'text-slate-900' : 'text-slate-400 font-normal'
                    )}
                  >
                    {checkIn ? format(checkIn, 'dd MMM yyyy') : t('bookingSearch.selectDate', 'Chọn ngày')}
                  </span>
                  {checkIn && (
                    <span className="text-[10px] text-slate-400">
                      {format(checkIn, 'EEEE')}
                    </span>
                  )}
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0 rounded-2xl shadow-xl border-slate-100">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={(d) => {
                  setCheckIn(d);
                  if (d && (!checkOut || d >= checkOut)) {
                    setCheckOut(addDays(d, 1));
                  }
                  setCheckInOpen(false);
                  if (d && !checkOut) {
                    setCheckOutOpen(true);
                  }
                }}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* FIELD 2: Check-out */}
        <div
          className={cn(
            'group transition-colors rounded-2xl relative',
            isHero ? 'px-5 py-3 hover:bg-slate-50/80 cursor-pointer' : isPage ? 'border border-slate-200 rounded-xl px-4 py-3 bg-white hover:border-slate-300' : 'px-2 py-1',
            checkOutOpen && 'bg-slate-50/80'
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t('bookingSearch.checkOutLabel', 'Trả phòng')}
            </label>
            {nights > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                <Moon className="w-2.5 h-2.5" />
                {nights} đêm
              </span>
            )}
          </div>
          <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 text-left w-full cursor-pointer group-hover:text-slate-900 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span
                    className={cn(
                      'text-sm font-semibold truncate',
                      checkOut ? 'text-slate-900' : 'text-slate-400 font-normal'
                    )}
                  >
                    {checkOut ? format(checkOut, 'dd MMM yyyy') : t('bookingSearch.selectDate', 'Chọn ngày')}
                  </span>
                  {checkOut && (
                    <span className="text-[10px] text-slate-400">
                      {format(checkOut, 'EEEE')}
                    </span>
                  )}
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0 rounded-2xl shadow-xl border-slate-100">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={(d) => {
                  setCheckOut(d);
                  setCheckOutOpen(false);
                }}
                disabled={(date) =>
                  checkIn ? date <= checkIn : date < new Date()
                }
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* FIELD 3: Guests */}
        <div
          className={cn(
            'group transition-colors rounded-2xl',
            isHero ? 'px-5 py-3 hover:bg-slate-50/80 cursor-pointer' : isPage ? 'border border-slate-200 rounded-xl px-4 py-3 bg-white hover:border-slate-300' : 'px-2 py-1',
            guestsOpen && 'bg-slate-50/80'
          )}
        >
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            {t('bookingSearch.guestsLabel', 'Khách & Phòng')}
          </label>
          <Popover open={guestsOpen} onOpenChange={setGuestsOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 text-left w-full cursor-pointer group-hover:text-slate-900 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-slate-900 truncate">
                    {t('bookingSearch.guestsCount', { count: guests, defaultValue: `${guests} khách` })}
                  </span>
                  <span className="text-[10px] text-slate-400">1 phòng</span>
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-4 rounded-2xl shadow-xl border-slate-100">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Số lượng khách</p>
                    <p className="text-xs text-slate-400">Người lớn & trẻ em</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setGuests((g) => Math.max(1, g - 1))}
                      disabled={guests <= 1}
                      className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-30 hover:border-slate-400 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-bold w-5 text-center text-slate-800">
                      {guests}
                    </span>
                    <button
                      type="button"
                      onClick={() => setGuests((g) => Math.min(10, g + 1))}
                      disabled={guests >= 10}
                      className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-30 hover:border-slate-400 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <Button
                    size="sm"
                    className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-xl"
                    onClick={() => setGuestsOpen(false)}
                  >
                    {t('bookingSearch.done', 'Xong')}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* SEARCH BUTTON */}
        <div className={cn('flex items-center', isHero ? 'px-2 py-2 md:py-0' : isPage ? 'px-1' : 'pl-2')}>
          <Button
            type="button"
            onClick={handleSearch}
            disabled={loading || !checkIn || !checkOut}
            className={cn(
              'relative font-bold transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-md hover:shadow-lg active:scale-98 overflow-hidden group',
              isHero || isPage
                ? 'w-full h-full min-h-[54px] px-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white hover:from-slate-800 hover:to-indigo-900 border border-slate-700/50'
                : 'h-10 px-5 rounded-xl bg-slate-900 text-white'
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/20 to-amber-400/0 -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>{t('bookingSearch.searching', 'Đang tìm...')}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="tracking-wide">{t('bookingSearch.searchButton', 'Tìm phòng ngay')}</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}