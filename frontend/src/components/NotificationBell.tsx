import { useEffect, useState, useRef } from "react";
import { useTranslation } from 'react-i18next';
import { Bell, CheckCircle2, XCircle, CreditCard, RefreshCw, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale"; // Import locales you need

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationSummaryResponse {
  success: boolean;
  data: Notification[];
  unreadCount: number;
}

export default function NotificationBell() {
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Determine date-fns locale based on i18next language
  const dateLocale = i18n.language === "vi" ? vi : enUS;

  const fetchSummary = async () => {
    try {
      const res = await apiRequest<NotificationSummaryResponse>(
        "/api/notifications?limit=5",
        "GET",
        undefined,
        { auth: true }
      );
      setNotifications(res.data);
      setUnreadCount(res.unreadCount);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    void fetchSummary();
    const interval = setInterval(fetchSummary, 60000); // Polling 60s
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (isOpen && user) {
      const handleOpen = async () => {
        if (unreadCount > 0) {
          try {
            await apiRequest("/api/notifications/read-all", "PATCH", undefined, { auth: true });
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
          } catch (err) {
            console.error("Failed to mark all as read", err);
          }
        }
        void fetchSummary();
      };
      void handleOpen();
    }
  }, [isOpen, user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, link: string) => {
    try {
      await apiRequest(`/api/notifications/${id}/read`, "PATCH", undefined, { auth: true });
      void fetchSummary();
      setIsOpen(false);
      navigate(link);
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "booking_confirmed": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "booking_cancelled": return <XCircle className="w-4 h-4 text-red-500" />;
      case "payment_success": return <CreditCard className="w-4 h-4 text-blue-500" />;
      case "refund_processed": return <RefreshCw className="w-4 h-4 text-orange-500" />;
      case "new_review": return <Star className="w-4 h-4 text-yellow-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-white/10 rounded-full transition-all duration-300"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900 text-sm italic tracking-tight uppercase">
              {t('notifications.title')}
            </h3>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-blue-100 text-blue-600 px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest">
                {t('notifications.newCount', { count: unreadCount })}
              </span>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => handleMarkAsRead(n._id, n.link)}
                  className={`w-full p-4 flex gap-3 text-left hover:bg-blue-50/50 transition-colors border-b border-gray-50 last:border-0 ${!n.isRead ? "bg-blue-50/20" : ""}`}
                >
                  <div className={`mt-1 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${!n.isRead ? "bg-white shadow-sm border border-blue-50" : "bg-gray-50"}`}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate tracking-tight ${!n.isRead ? "text-gray-900" : "text-gray-500"}`}>
                      {n.title}
                    </p>
                    <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-[9px] text-gray-400 mt-1 font-medium">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: dateLocale })}
                    </p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2.5 flex-shrink-0 animate-pulse" />}
                </button>
              ))
            ) : (
              <div className="p-10 text-center text-gray-400 flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                  <Bell className="w-6 h-6 opacity-20" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500">{t('notifications.empty')}</p>
                  <p className="text-[10px] text-gray-400">{t('notifications.emptyDesc')}</p>
                </div>
              </div>
            )}
          </div>

          <Link
            to="/notifications"
            onClick={() => setIsOpen(false)}
            className="block text-center p-3 text-xs font-black text-blue-600 hover:bg-blue-600 hover:text-white transition-all border-t border-gray-50 uppercase tracking-widest bg-gray-50/50"
          >
            {t('notifications.viewAll')}
          </Link>
        </div>
      )}
    </div>
  );
}