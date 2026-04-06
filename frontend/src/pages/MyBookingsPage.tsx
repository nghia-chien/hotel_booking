import { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from '../../node_modules/react-i18next';
import { useCart } from "../context/CartContext";
import { cn } from "../components/ui/utils";
import PaymentHistoryPage from "./PaymentHistoryPage";
import { AlertTriangle, Loader2 } from "lucide-react";
import BookingSummaryCard from "../components/BookingSummaryCard";
import { useBookingFeature } from "../features/booking/hooks";
import { usePaymentFeature } from "../features/payment/hooks";
import { useRoomFeature } from "../features/room/hooks";

const MyBookingsPage = () => {
  const { t } = useTranslation();
  const { cartItems, cartCount, removeFromCart, clearCart } = useCart();
  const { createNewBooking } = useBookingFeature();
  const { createVNPayOrder, loading: payLoading } = usePaymentFeature();
  const { checkAvailability, loading: checkingAvailability } = useRoomFeature();

  const location = useLocation();
  const [activeTab, setActiveTab] = useState<"cart" | "history">(
    (location.state as any)?.tab === "history" || cartCount === 0 ? "history" : "cart"
  );

  const [conflicts, setConflicts] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const performCheckAvailability = useCallback(async () => {
    if (cartItems.length === 0) return;
    const results = await Promise.all(
      cartItems.map(async (item) => {
        const res = await checkAvailability({
          roomId: item.roomId,
          checkIn: item.checkIn,
          checkOut: item.checkOut,
          guests: item.guests
        });
        return { roomId: item.roomId, available: res?.available ?? true };
      })
    );
    const conflictIds = new Set(
      results.filter((r) => !r.available).map((r) => r.roomId)
    );
    setConflicts(conflictIds);
  }, [cartItems, checkAvailability]);

  useEffect(() => {
    if (activeTab === "cart") {
      void performCheckAvailability();
    }
  }, [activeTab, performCheckAvailability]);

  const handlePay = async () => {
    const payableItems = cartItems.filter(item => !conflicts.has(item.roomId));
    if (payableItems.length === 0) return;

    setError(null);
    try {
      const bookingResults = await Promise.all(
        payableItems.map(async (item) => {
          const res = await createNewBooking({
            roomId: item.roomId,
            checkIn: item.checkIn,
            checkOut: item.checkOut,
            guestInfo: {
              fullName: "User",
              email: "user@example.com",
              phone: "123456789"
            }
          });
          return res._id || res.id;
        })
      );

      const paymentUrl = await createVNPayOrder(bookingResults);
      clearCart();
      window.location.assign(paymentUrl);
    } catch (err: any) {
      clearCart();
      setError(err.message || "Quá trình thanh toán thất bại");
    }
  };

  const totalPrice = cartItems
    .filter(i => !conflicts.has(i.roomId))
    .reduce((sum, i) => sum + i.totalPrice, 0);

  const hasConflicts = conflicts.size > 0;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold font-serif text-[#1F1F1F] mb-6">{t('myBookings.title')}</h1>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={cn(
            "px-6 py-3 font-medium text-sm transition-colors relative",
            activeTab === "cart" ? "text-emerald-600" : "text-gray-500 hover:text-gray-700"
          )}
          onClick={() => setActiveTab("cart")}
        >
          Giỏ hàng {cartCount > 0 && <span className="ml-1 bg-emerald-100 text-emerald-700 text-xs font-bold px-1.5 py-0.5 rounded-full">{cartCount}</span>}
          {activeTab === "cart" && <span className="absolute bottom-[-1px] left-0 {w-full} h-[2px] bg-emerald-600 rounded-t-full" />}
        </button>
        <button
          className={cn(
            "px-6 py-3 font-medium text-sm transition-colors relative",
            activeTab === "history" ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"
          )}
          onClick={() => setActiveTab("history")}
        >
          {t('myBookings.tabHistory')}
          {activeTab === "history" && <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-indigo-600 rounded-t-full" />}
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-xl mb-4 border border-red-100">{error}</div>}

      {activeTab === "cart" && (
        <div className="animate-in fade-in duration-300">
          {cartItems.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-gray-500 mb-4">{t('cart.empty')}</p>
              <Link to="/rooms" className="text-emerald-600 font-medium hover:underline">{t('cart.emptyHint')}</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {checkingAvailability && (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang kiểm tra tình trạng phòng...
                </div>
              )}

              {hasConflicts && !checkingAvailability && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800">Một số phòng đã được người khác đặt</p>
                    <p className="text-sm text-red-600 mt-1">
                      Các phòng bị đánh dấu đỏ không thể thanh toán. Vui lòng xóa chúng khỏi giỏ và chọn phòng khác.
                    </p>
                  </div>
                </div>
              )}

              {cartItems.map((item) => (
                <BookingSummaryCard
                  key={item.roomId}
                  mode="cart"
                  data={{
                    roomId: item.roomId,
                    roomNumber: item.roomNumber,
                    roomTypeName: item.roomTypeName,
                    image: item.image,
                    checkIn: item.checkIn,
                    checkOut: item.checkOut,
                    guests: item.guests,
                    capacity: item.capacity,
                    totalPrice: item.totalPrice
                  }}
                  conflict={conflicts.has(item.roomId)}
                  onRemove={removeFromCart}
                />
              ))}

              <div className="sticky bottom-6 mt-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-500">
                    {cartItems.filter(i => !conflicts.has(i.roomId)).length} phòng có thể thanh toán
                  </p>
                  <p className="text-xl font-bold text-gray-900">${totalPrice.toLocaleString("en-US")}</p>
                </div>
                <button
                  onClick={handlePay}
                  disabled={payLoading || cartItems.filter(i => !conflicts.has(i.roomId)).length === 0}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm whitespace-nowrap"
                >
                  {payLoading ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...</span>
                  ) : (
                    `Thanh toán ${cartItems.filter(i => !conflicts.has(i.roomId)).length} phòng`
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <PaymentHistoryPage />
      )}
    </div>
  );
};

export default MyBookingsPage;