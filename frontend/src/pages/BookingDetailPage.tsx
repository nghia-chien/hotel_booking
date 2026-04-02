import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "../../node_modules/react-i18next";
import { apiRequest } from "../api/client";
import {
  Calendar,
  ChevronLeft,
  MapPin,
  Moon,
  CreditCard,
  Download,
  QrCode,
  Loader2,
  CheckCircle2,
  XCircle,
  Star,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { format, differenceInDays } from "date-fns";
import { StatusBadge } from "../components/admin";

interface Room {
  _id: string;
  name: string;
  images: string[];
}

interface RoomType {
  _id: string;
  name: string;
}

interface Booking {
  _id: string;
  room: Room;
  roomType: RoomType;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: "Pending" | "Confirmed" | "CheckedIn" | "CheckedOut" | "Cancelled";
  paymentStatus: string;
  createdAt: string;
};

export default function BookingDetailPage() {
  const { t } = useTranslation(); 
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const loadBooking = async () => {
    try {
      const res = await apiRequest<{ success: boolean; data: Booking }>(
        `/api/bookings/${id}`,
        "GET",
        undefined,
        { auth: true }
      );
      setBooking(res.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const checkReview = async () => {
    try {
      const res = await apiRequest<{ success: boolean; data: any }>(
        `/api/reviews/check/${id}`,
        "GET",
        undefined,
        { auth: true }
      );
      setHasReviewed(res.success && !!res.data);
    } catch (err) {
      console.error("Error checking review:", err);
    }
  };

  useEffect(() => {
    void loadBooking();
  }, [id]);

  useEffect(() => {
    if (booking?.status === "CheckedOut") {
      void checkReview();
    }
  }, [booking?.status]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await apiRequest(
        "/api/reviews",
        "POST",
        { bookingId: id, rating, comment },
        { auth: true }
      );
      setHasReviewed(true);
      setShowReviewModal(false);
      
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!booking) return;
    setDownloading(true);
    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/bookings/${booking._id}/invoice`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
      });

      if (!resp.ok) throw new Error(t('bookingDetail.alerts.invoiceError'));

      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${booking._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-gray-500">{t('bookingDetail.loadingInfo')}</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <XCircle className="w-16 h-16 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold">{t('bookingDetail.error.title')}</h2>
        <p className="text-gray-600">{error || t('bookingDetail.error.message')}</p>
        <button onClick={() => navigate("/my-bookings")} className="text-blue-600 hover:underline">
          {t('bookingDetail.error.backToList')}
        </button>
      </div>
    );
  }

  const nights = differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn));
  const pricePerNight = booking.totalPrice / nights;
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const roomImage = booking.room.images?.[0] ?
    (booking.room.images[0].startsWith("http") ? booking.room.images[0] : `${API_URL}${booking.room.images[0]}`) :
    null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={() => navigate("/my-bookings")}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        {t('bookingDetail.back')}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Info */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-64 relative">
              {roomImage ? (
                <img src={roomImage} alt={booking.room.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                  {t('bookingDetail.noImage')}
                </div>
              )}
              <div className="absolute top-4 left-4">
                <StatusBadge status={booking.status} />
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{booking.room.name}</h1>
                <p className="text-gray-500 flex items-center gap-1 capitalize">
                  <MapPin className="w-4 h-4" /> {booking.roomType.name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-y border-gray-50 py-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Check-in</label>
                  <div className="flex items-center gap-2 font-medium">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    {format(new Date(booking.checkIn), "dd/MM/yyyy")}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Check-out</label>
                  <div className="flex items-center gap-2 font-medium">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    {format(new Date(booking.checkOut), "dd/MM/yyyy")}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t('bookingDetail.nightsCount', { count: nights })}</p>
                    <p className="text-xs text-gray-500">{t('bookingDetail.guestsCount', { count: booking.guests })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{t('bookingDetail.total')}</p>
                  <p className="text-lg font-bold text-blue-600">{booking.totalPrice.toLocaleString()} $</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-400" />
              {t('bookingDetail.priceDetail')}
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('bookingDetail.nightsCount', { count: nights })} × {pricePerNight.toLocaleString()} $</span>
                <span className="font-medium text-gray-900">{booking.totalPrice.toLocaleString()} $</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-3">
                <span>{t('bookingDetail.totalVat')}</span>
                <span className="text-blue-600">{booking.totalPrice.toLocaleString()} $</span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Actions & QR */}
        <div className="space-y-6">
          {(booking.status === "Confirmed" || booking.status === "CheckedIn") && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center space-y-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <QrCode className="w-5 h-5 text-gray-400" />
                <h3 className="font-bold">{t('bookingDetail.qr.title')}</h3>
              </div>
              <div className="inline-block p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <QRCodeSVG value={booking._id} size={150} level="M" />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {t('bookingDetail.qr.instruction')}
              </p>
            </div>
          )}

          {(booking.status === "Confirmed" || booking.status === "CheckedIn" || booking.status === "CheckedOut") && (
            <button
              onClick={handleDownloadInvoice}
              disabled={downloading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-gray-900/10 disabled:opacity-50"
            >
              {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {t('bookingDetail.actions.downloadInvoice')}
            </button>
          )}

          {booking.status === "CheckedOut" && !hasReviewed && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
            >
              <MessageSquare className="w-5 h-5" />
              {t('bookingDetail.actions.reviewRoom')}
            </button>
          )}

          {booking.status === "CheckedOut" && hasReviewed && (
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <p className="text-sm font-bold text-emerald-700">{t('bookingDetail.actions.reviewed')}</p>
            </div>
          )}

          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
            <h4 className="text-blue-800 font-bold mb-2">{t('bookingDetail.support.title')}</h4>
            <p className="text-sm text-blue-700 leading-relaxed mb-4">
              {t('bookingDetail.support.desc')}
            </p>
            <p className="font-bold text-blue-900">{t('bookingDetail.support.hotline')} 1900 1234</p>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-blue-600 text-white relative">
              <h3 className="text-xl font-bold text-center">{t('bookingDetail.reviewModal.title')}</h3>
              <p className="text-blue-100 text-sm text-center mt-1">{t('bookingDetail.reviewModal.subtitle')}</p>
              <button
                onClick={() => setShowReviewModal(false)}
                className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors"
                disabled={submitting}
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleReviewSubmit} className="p-8 space-y-6">
              <div className="space-y-3 text-center">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">{t('bookingDetail.reviewModal.roomQuality')}</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      disabled={submitting}
                      className={`transition-all duration-300 ${s <= rating ? "text-yellow-400 scale-125 drop-shadow-sm" : "text-gray-200 hover:text-gray-300"}`}
                    >
                      <Star className={`w-10 h-10 ${s <= rating ? "fill-current" : ""}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-widest flex justify-between">
                  {t('bookingDetail.reviewModal.commentLabel')}
                  <span className={`${comment.length > 500 ? "text-red-500" : "text-gray-300"}`}>{comment.length}/500</span>
                </label>
                <textarea
                  required
                  rows={4}
                  maxLength={500}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={submitting}
                  placeholder={t('bookingDetail.reviewModal.commentPlaceholder')}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none text-gray-700"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-2xl border border-yellow-100 text-yellow-800 text-xs leading-relaxed">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {t('bookingDetail.reviewModal.publicNotice')}
              </div>

              <button
                type="submit"
                disabled={submitting || !comment.trim()}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('bookingDetail.reviewModal.submitting')}
                  </>
                ) : t('bookingDetail.reviewModal.submit')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}