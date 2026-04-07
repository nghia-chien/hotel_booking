import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../../node_modules/react-i18next';
import { format } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Users,
  Search,
  Loader2,
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
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [guests, setGuests] = useState(2);

  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);

  const isHero = variant === 'hero';
  const isPage = variant === 'page';
  const isCompact = variant === 'compact';

  const lastSearchRef = useRef<{ checkIn?: Date; checkOut?: Date; guests?: number }>({});

  useEffect(() => {
    if (checkIn && checkOut) {
      const checkInTime = checkIn.getTime();
      const checkOutTime = checkOut.getTime();
      const prevCheckInTime = lastSearchRef.current.checkIn?.getTime();
      const prevCheckOutTime = lastSearchRef.current.checkOut?.getTime();

      if (
        checkInTime !== prevCheckInTime ||
        checkOutTime !== prevCheckOutTime ||
        guests !== lastSearchRef.current.guests
      ) {
        lastSearchRef.current = { checkIn, checkOut, guests };
        onSearch({ checkIn, checkOut, guests });
      }
    }
  }, [checkIn, checkOut, guests, onSearch]);

  const FieldWrapper = ({
    label,
    children,
    className: fieldClassName,
  }: {
    label: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <div
      className={cn(
        isHero ? 'px-4 py-3' : isPage ? 'border border-[var(--color-border)] rounded-xl px-4 py-3 bg-white' : 'px-3 py-2',
        fieldClassName
      )}
    >
      <label
        className={cn(
          'block font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-1',
          isHero || isPage ? 'text-[10px]' : 'sr-only'
        )}
      >
        {label}
      </label>
      {children}
    </div>
  );

  return (
    <div
      className={cn(
        'bg-white',
        isHero ? 'rounded-2xl p-2 shadow-[var(--shadow-xl)]' : 
        isPage ? 'rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-4' : 
        'rounded-xl p-2 flex gap-2 items-center',
        className
      )}
    >
      <div
        className={cn(
          'w-full',
          isHero
            ? 'grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] md:divide-x divide-gray-100' :
          isPage
            ? 'grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3'
            : 'flex gap-2 items-center'
        )}
      >
        {/* FIELD 1: Check-in */}
        <FieldWrapper label={t('bookingSearch.checkInLabel')} className={isCompact ? 'flex-1' : ''}>
          <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-medium text-left w-full cursor-pointer"
              >
                <CalendarIcon className="w-4 h-4 text-[var(--color-text-muted)]" />
                <span
                  className={
                    checkIn
                      ? 'text-[var(--color-text-primary)]'
                      : 'text-[var(--color-text-muted)]'
                  }
                >
                  {checkIn ? format(checkIn, 'dd MMM yyyy') : t('bookingSearch.selectDate')}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={(d) => {
                  setCheckIn(d);
                  setCheckInOpen(false);
                }}
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </FieldWrapper>

        {/* FIELD 2: Check-out */}
        <FieldWrapper label={t('bookingSearch.checkOutLabel')} className={isCompact ? 'flex-1' : ''}>
          <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-medium text-left w-full cursor-pointer"
              >
                <CalendarIcon className="w-4 h-4 text-[var(--color-text-muted)]" />
                <span
                  className={
                    checkOut
                      ? 'text-[var(--color-text-primary)]'
                      : 'text-[var(--color-text-muted)]'
                  }
                >
                  {checkOut ? format(checkOut, 'dd MMM yyyy') : t('bookingSearch.selectDate')}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
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
        </FieldWrapper>

        {/* FIELD 3: Guests */}
        <FieldWrapper label={t('bookingSearch.guestsLabel')} className={isCompact ? 'flex-1' : ''}>
          <Popover open={guestsOpen} onOpenChange={setGuestsOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-medium w-full cursor-pointer"
              >
                <Users className="w-4 h-4 text-[var(--color-text-muted)]" />
                <span className="text-[var(--color-text-primary)]">
                  {t('bookingSearch.guestsCount', { count: guests })}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-52">
              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('bookingSearch.guestsLabel')}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setGuests((g) => Math.max(1, g - 1))}
                      disabled={guests <= 1}
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-sm font-bold disabled:opacity-40 hover:border-gray-400 transition-colors cursor-pointer"
                    >
                      −
                    </button>
                    <span className="text-sm font-medium w-4 text-center">
                      {guests}
                    </span>
                    <button
                      onClick={() => setGuests((g) => Math.min(10, g + 1))}
                      disabled={guests >= 10}
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-sm font-bold disabled:opacity-40 hover:border-gray-400 transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => setGuestsOpen(false)}
                >
                  {t('bookingSearch.done')}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </FieldWrapper>

      </div>
    </div>
  );
}