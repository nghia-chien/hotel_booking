import { useMemo, useState } from "react";
import { Calendar as CalendarIcon, Users } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { apiRequest } from "../api/client";
import { createBooking } from "../api/booking.api";

interface PriceResponse {
  success: boolean;
  data: {
    totalPrice: number;
    nights: number;
    pricePerNight: number;
  };
}

export function BookingCard({
  roomId,
  capacity
}: {
  roomId: string;
  capacity: number;
}) {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(2);
  const [guestsOpen, setGuestsOpen] = useState(false);

  const [loadingPrice, setLoadingPrice] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [priceSummary, setPriceSummary] = useState<PriceResponse["data"] | null>(null);

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const canQuote = Boolean(checkIn && checkOut && guests >= 1);

  const handleGuestChange = (delta: number) => {
    setGuests((prev) => Math.max(1, Math.min(capacity, prev + delta)));
  };

  const quotePrice = async () => {
    if (!checkIn || !checkOut) return;
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

  // Thêm phòng vào giỏ, chuyển sang MyBookings để thanh toán sau
  const handleAddRoom = async () => {
    if (!checkIn || !checkOut) return;
    setBookingError(null);
    setBookingLoading(true);
    try {
      const bookingId = await createBookingForThisRoom();
      if (!bookingId) return;
      navigate("/my-bookings", {
        state: { message: "Đã thêm phòng chờ thanh toán." }
      });
    } catch (err) {
      setBookingError((err as Error).message);
    } finally {
      setBookingLoading(false);
    }
  };

  // Đặt phòng + thanh toán ngay qua VNPay
  const handleBookAndPayVNPay = async () => {
    if (!checkIn || !checkOut) return;
    setBookingError(null);
    setBookingLoading(true);

    try {
      // Bước 1: tạo booking, lấy _id
      const bookingId = await createBookingForThisRoom();
      if (!bookingId) throw new Error("Không tạo được booking");

      // Bước 2: tạo VNPay order, nhận paymentUrl
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
      <h3 className="text-lg font-semibold text-[#1F1F1F]">Đặt phòng</h3>

      <div className="grid grid-cols-1 gap-3">
        <div>
          <p className="text-sm text-[#666666] mb-2">Ngày nhận phòng</p>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left bg-[#F5F1ED] border-[#E8DFD8] hover:bg-[#E8DFD8] h-11"
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-[#2C2C2C]" />
                <span className="text-[#2C2C2C]">
                  {checkIn ? format(checkIn, "MMM dd, yyyy") : "Chọn ngày"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <p className="text-sm text-[#666666] mb-2">Ngày trả phòng</p>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left bg-[#F5F1ED] border-[#E8DFD8] hover:bg-[#E8DFD8] h-11"
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-[#2C2C2C]" />
                <span className="text-[#2C2C2C]">
                  {checkOut ? format(checkOut, "MMM dd, yyyy") : "Chọn ngày"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={setCheckOut}
                disabled={(date) => (checkIn ? date <= checkIn : false)}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <p className="text-sm text-[#666666] mb-2">Số khách</p>
          <Popover open={guestsOpen} onOpenChange={setGuestsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left bg-[#F5F1ED] border-[#E8DFD8] hover:bg-[#E8DFD8] h-11"
              >
                <Users className="mr-2 h-4 w-4 text-[#2C2C2C]" />
                <span className="text-[#2C2C2C]">
                  {guests} khách (tối đa {capacity})
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#2C2C2C]">Khách</span>
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
                  Xong
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <Button
            variant="outline"
            className="rounded-xl border-[#E8DFD8] bg-white hover:bg-[#F5F1ED]"
            onClick={quotePrice}
            disabled={!canQuote || loadingPrice}
          >
            {loadingPrice ? "Đang tính giá..." : "Tính giá"}
          </Button>

          {priceError && (
            <p className="text-sm text-red-600">{priceError}</p>
          )}

          {summaryText && (
            <div className="rounded-xl bg-[#F7F2EA] border border-black/5 p-3">
              <p className="text-sm text-black/60">
                {summaryText.nights} đêm · ${summaryText.perNight}/đêm
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
              {bookingLoading ? "Đang xử lý..." : "Thêm phòng"}
            </Button>
            <Button
              className="rounded-xl bg-[#2C2C2C] hover:bg-[#3A3A3A] text-white"
              onClick={handleBookAndPayVNPay}
              disabled={!canQuote || bookingLoading}
            >
              {bookingLoading ? "Đang xử lý..." : "Đặt & thanh toán"}
            </Button>
          </div>

          {bookingError && (
            <p className="text-sm text-red-600">{bookingError}</p>
          )}
        </div>
      </div>

      <div>
        <p className="text-xs text-black/50 mb-2">
          Gợi ý: hãy bấm "Tính giá" để xem tổng tiền trước khi đặt.
        </p>
        <Input
          placeholder="Yêu cầu đặc biệt (tuỳ chọn) — sẽ bổ sung ở bước sau"
          disabled
        />
      </div>
    </div>
  );
}