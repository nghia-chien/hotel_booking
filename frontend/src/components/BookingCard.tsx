import { useMemo, useState, useEffect } from "react";
import { Calendar as CalendarIcon, Users } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { apiRequest } from "../api/client";
import { createBooking } from "../api/booking.api";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from '../../node_modules/react-i18next';
import { useCart } from "../context/CartContext";

interface PriceResponse {
  success: boolean;
  data: {
    totalPrice: number;
    nights: number;
    pricePerNight: number;
  };
}

export function BookingCard({
  room
}: {
  room: {
    _id: string;
    capacity: number;
    roomNumber: string;
    roomType?: { name: string; basePrice?: number };
    images?: string[];
    amenities?: string[];
  }
}) {
  const roomId = room._id;
  const capacity = room.capacity;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [addedMsg, setAddedMsg] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(2);
  const [guestsOpen, setGuestsOpen] = useState(false);

  const [loadingPrice, setLoadingPrice] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [priceSummary, setPriceSummary] = useState<PriceResponse["data"] | null>(null);

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookedDates, setBookedDates] = useState<{ checkIn: Date; checkOut: Date }[]>([]);

  // Fetch booked dates
  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const res = await apiRequest<{ success: boolean; data: any[] }>(
          `/api/public/rooms/${roomId}/booked-dates`,
          "GET"
        );
        setBookedDates(res.data.map(b => ({
          checkIn: new Date(b.checkIn),
          checkOut: new Date(b.checkOut)
        })));
      } catch (err) {
        console.error("Failed to fetch booked dates:", err);
      }
    };
    void fetchBookedDates();
  }, [roomId]);

  const canQuote = Boolean(checkIn && checkOut && guests >= 1);

  const handleGuestChange = (delta: number) => {
    setGuests((prev) => Math.max(1, Math.min(capacity, prev + delta)));
  };

  useEffect(() => {
    if (!checkIn || !checkOut) {
      setPriceSummary(null);
      return;
    }
    const fetchPrice = async () => {
      setPriceError(null);
      setLoadingPrice(true);
      try {
        const params = new URLSearchParams({
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          guests: String(guests)
        }).toString();
        const res = await apiRequest<PriceResponse>(
          `/api/public/rooms/${roomId}/price?${params}`,
          "GET"
        );
        setPriceSummary(res.data);
      } catch (err) {
        setPriceError((err as Error).message);
        setPriceSummary(null);
      } finally {
        setLoadingPrice(false);
      }
    };
    void fetchPrice();
  }, [checkIn, checkOut, guests, roomId]);

  const createBookingForThisRoom = async (): Promise<string | null> => {
    if (!checkIn || !checkOut) return null;
    const res = (await createBooking({
      roomId,
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      guests
    })) as { data: { _id: string } };

    return res.data._id;
  };

  // add room to cart, go to MyBookings to pay later
  const handleAddRoom = async () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: window.location.pathname } } });
      return;
    }
    if (!checkIn || !checkOut || !priceSummary) return;

    addToCart({
      roomId: room._id,
      roomTypeName: room.roomType?.name || 'Unknown',
      roomNumber: room.roomNumber,
      image: room.images?.[0],
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      guests,
      totalPrice: priceSummary.totalPrice,
      capacity: room.capacity,
      amenities: room.amenities,
    });

    setAddedMsg(t('bookingForm.addedToCart'));
    setTimeout(() => setAddedMsg(null), 3000);
  };

  // book room + pay immediately via VNPay
  const handleBookAndPayVNPay = async () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: window.location.pathname } } });
      return;
    }
    if (!checkIn || !checkOut) return;
    setBookingError(null);
    setBookingLoading(true);

    try {
      // step 1: create booking, get _id
      const bookingId = await createBookingForThisRoom();
      if (!bookingId) throw new Error("Không tạo được booking");

      // step 2: create VNPay order, get paymentUrl
      // FIX: added /api prefix
      const res = await apiRequest<{
        success: boolean;
        data?: { paymentUrl?: string; txnRef?: string };
        message?: string;
      }>("/api/payments/vnpay/create-order", "POST", { bookingId }, { auth: true });

      const paymentUrl = res?.data?.paymentUrl;

      if (res?.success && paymentUrl) {
        // Bước 3: redirect sang cổng VNPay
        window.location.assign(paymentUrl);
        return;
      }

      throw new Error(res?.message || "Không lấy được URL thanh toán");
    } catch (err: unknown) {
      let msg = "Có lỗi xảy ra. Vui lòng thử lại.";
      if (typeof err === "object" && err !== null) {
        const e = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        msg = e.response?.data?.message || e.message || msg;
      }
      setBookingError(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  const summaryText = useMemo(() => {
    if (!priceSummary) return null;
    return {
      total: priceSummary.totalPrice.toFixed(2),
      perNight: priceSummary.pricePerNight.toFixed(2),
      nights: priceSummary.nights
    };
  }, [priceSummary]);

  return (
    <div className="bg-white border border-black/5 rounded-xl p-5 shadow-sm space-y-4">
      <h3 className="text-lg font-semibold text-[#1F1F1F]">{t('bookingForm.title')}</h3>

      <div className="grid grid-cols-1 gap-3">
        <div>
          <p className="text-sm text-[#666666] mb-2">{t('bookingForm.checkIn')}</p>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left bg-[#F5F1ED] border-[#E8DFD8] hover:bg-[#E8DFD8] h-11"
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-[#2C2C2C]" />
                <span className="text-[#2C2C2C]">
                  {checkIn ? format(checkIn, "MMM dd, yyyy") : t('bookingForm.selectDate')}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={setCheckIn}
                disabled={(date) => {
                  // Disable past dates
                  if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;
                  // Disable booked dates
                  return bookedDates.some((b: any) =>
                    date >= new Date(b.checkIn.setHours(0, 0, 0, 0)) &&
                    date < new Date(b.checkOut.setHours(0, 0, 0, 0))
                  );
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <p className="text-sm text-[#666666] mb-2">{t('bookingForm.checkOut')}</p>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left bg-[#F5F1ED] border-[#E8DFD8] hover:bg-[#E8DFD8] h-11"
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-[#2C2C2C]" />
                <span className="text-[#2C2C2C]">
                  {checkOut ? format(checkOut, "MMM dd, yyyy") : t('bookingForm.selectDate')}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={setCheckOut}
                disabled={(date) => {
                  // Must be after check-in
                  if (checkIn && date <= checkIn) return true;
                  // Must not be in the past
                  if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;
                  // Must not overlap with a booking that starts after check-in
                  if (checkIn) {
                    const nextBooking = bookedDates
                      .filter((b: any) => b.checkIn > checkIn)
                      .sort((a: any, b: any) => a.checkIn.getTime() - b.checkIn.getTime())[0];
                    if (nextBooking && date > nextBooking.checkIn) return true;
                  }
                  return bookedDates.some((b: any) =>
                    date > new Date(b.checkIn.setHours(0, 0, 0, 0)) &&
                    date <= new Date(b.checkOut.setHours(0, 0, 0, 0))
                  );
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <p className="text-sm text-[#666666] mb-2">{t('bookingForm.guests')}</p>
          <Popover open={guestsOpen} onOpenChange={setGuestsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left bg-[#F5F1ED] border-[#E8DFD8] hover:bg-[#E8DFD8] h-11"
              >
                <Users className="mr-2 h-4 w-4 text-[#2C2C2C]" />
                <span className="text-[#2C2C2C]">
                  {t('bookingForm.guestsCount', { count: guests, max: capacity })}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#2C2C2C]">{t('bookingForm.guestLabel')}</span>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleGuestChange(-1)}
                      disabled={guests <= 1}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{guests}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleGuestChange(1)}
                      disabled={guests >= capacity}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <Button
                  className="w-full bg-[#2C2C2C] hover:bg-[#3A3A3A] text-white"
                  onClick={() => setGuestsOpen(false)}
                >
                  {t('bookingForm.done')}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {loadingPrice && (
            <div className="text-sm text-gray-500 py-1">
              {t('bookingForm.calculating')}
            </div>
          )}

          {priceError && (
            <p className="text-sm text-red-600">{priceError}</p>
          )}

          {summaryText && (
            <div className="rounded-xl bg-[#F7F2EA] border border-black/5 p-3">
              <p className="text-sm text-black/60">
                {t('bookingForm.summary', { nights: summaryText.nights, price: summaryText.perNight })}
              </p>
              <p className="text-2xl font-semibold text-[#2B2B2B]">
                ${summaryText.total}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="rounded-xl border-[#E8DFD8] bg-white hover:bg-[#F5F1ED]"
              onClick={handleAddRoom}
              disabled={!canQuote || bookingLoading}
            >
              {bookingLoading ? t('bookingForm.processing') : t('bookingForm.addToCart')}
            </Button>
            <Button
              className="rounded-xl bg-[#2C2C2C] hover:bg-[#3A3A3A] text-white"
              onClick={handleBookAndPayVNPay}
              disabled={!canQuote || bookingLoading}
            >
              {bookingLoading ? t('bookingForm.processing') : t('bookingForm.bookAndPay')}
            </Button>
          </div>

          {addedMsg && (
            <div className="text-sm text-emerald-600 font-medium py-1 text-center">
              {addedMsg}
            </div>
          )}

          {bookingError && (
            <p className="text-sm text-red-600">{bookingError}</p>
          )}
        </div>
      </div>

      <div>
        <p className="text-xs text-black/50 mb-2">
          {t('bookingForm.hint')}
        </p>
        <Input
          placeholder={t('bookingForm.specialRequest')}
          disabled
        />
      </div>
    </div>
  );
}