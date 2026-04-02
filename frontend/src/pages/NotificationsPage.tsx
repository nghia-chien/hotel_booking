import { useEffect, useState, useCallback } from "react";
import { Bell, CheckCircle2, XCircle, CreditCard, RefreshCw, Star, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../node_modules/react-i18next";
import { apiRequest } from "../api/client";
import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationListResponse {
  success: boolean;
  data: Notification[];
  total: number;
  unreadCount: number;
}

export default function NotificationsPage() {
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const dateLocale = i18n.language === "vi" ? vi : enUS;

  const fetchFull = useCallback(async () => {
    setLoading(true);
    try {
      const url = filter === "all" ? "/api/notifications?limit=50" : "/api/notifications?isRead=false&limit=50";
      const res = await apiRequest<NotificationListResponse>(url, "GET", undefined, { auth: true });
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void fetchFull();
  }, [fetchFull]);

  const handleMarkRead = async (id: string) => {
    try {
      await apiRequest(`/api/notifications/${id}/read`, "PATCH", undefined, { auth: true });
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
       console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiRequest("/api/notifications/read-all", "PATCH", undefined, { auth: true });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiRequest(`/api/notifications/${id}`, "DELETE", undefined, { auth: true });
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "booking_confirmed": return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "booking_cancelled": return <XCircle className="w-5 h-5 text-red-500" />;
      case "payment_success": return <CreditCard className="w-5 h-5 text-blue-500" />;
      case "refund_processed": return <RefreshCw className="w-5 h-5 text-orange-500" />;
      case "new_review": return <Star className="w-5 h-5 text-yellow-500" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-8">
        <div>
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 border border-gray-100 shadow-sm">
             {t('notifications.systemLabel')}
           </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">{t('notifications.title')}</h1>
           <p className="text-gray-400 text-sm mt-1">{t('notifications.subtitle')}</p>
        </div>
        
        <div className="flex gap-2">
           <button 
             onClick={handleMarkAllRead}
             className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md active:scale-95"
           >
             <CheckCircle className="w-4 h-4" /> {t('notifications.markAllRead')}
           </button>
        </div>
      </div>

      <div className="flex bg-gray-50/50 p-1 rounded-2xl w-fit border border-gray-100 shadow-inner">
        <button 
          onClick={() => setFilter("all")}
          className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === "all" ? "bg-white text-blue-600 shadow-sm ring-1 ring-gray-100" : "text-gray-400 hover:text-gray-600"}`}
        >
          {t('common.all')}
        </button>
        <button 
          onClick={() => setFilter("unread")}
          className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === "unread" ? "bg-white text-blue-600 shadow-sm ring-1 ring-gray-100" : "text-gray-400 hover:text-gray-600"}`}
        >
          {t('notifications.unread')}
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-300 gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-100" />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 animate-pulse">{t('notifications.syncing')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div 
                key={n._id}
                className={`group flex items-start gap-5 p-6 rounded-3xl border transition-all hover:shadow-xl hover:scale-[1.01] ${!n.isRead ? "bg-white border-blue-100 shadow-sm shadow-blue-500/5 ring-1 ring-blue-50/50" : "bg-gray-50/30 border-gray-100 grayscale-[0.5] opacity-80"}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 transition-all group-hover:rotate-6 duration-300 ${!n.isRead ? "bg-blue-50/50 border border-blue-50 shadow-inner" : "bg-gray-100 shadow-inner"}`}>
                   {getIcon(n.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-3 mb-1.5">
                     <h3 className={`font-black uppercase italic tracking-tight text-sm flex items-center gap-2 ${!n.isRead ? "text-gray-900 font-bold" : "text-gray-500"}`}>
                       {n.title}
                       {!n.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
                     </h3>
                     <span className="text-[9px] text-gray-400 font-black uppercase ml-auto tracking-widest">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: dateLocale })}
                     </span>
                   </div>
                   <p className="text-gray-600 text-sm leading-relaxed mb-4">
                     {n.message}
                   </p>
                   
                   <div className="flex items-center gap-6 pt-4 border-t border-gray-100/50">
                      <Link 
                        to={n.link}
                        onClick={() => handleMarkRead(n._id)}
                        className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 flex items-center gap-1 group/link"
                      >
                        {t('notifications.viewDetails')} <CheckCircle2 className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 transition-all -translate-x-1 group-hover/link:translate-x-0" />
                      </Link>
                      
                      {!n.isRead && (
                        <button 
                          onClick={() => handleMarkRead(n._id)}
                          className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-emerald-600 transition-colors pl-6 border-l border-gray-100"
                        >
                          {t('notifications.markAsRead')}
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleDelete(n._id)}
                        className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-all ml-auto md:opacity-0 group-hover:opacity-100 flex items-center gap-1.5"
                      >
                         <Trash2 className="w-3.5 h-3.5" /> {t('common.delete')}
                      </button>
                   </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-24 text-center flex flex-col items-center gap-5 bg-gray-50/30 rounded-[3rem] border-2 border-dashed border-gray-100">
               <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner grayscale opacity-30">
                  <Bell className="w-10 h-10 text-gray-300" />
               </div>
               <div className="space-y-1">
                  <p className="font-black uppercase italic tracking-tighter text-gray-400 text-xl">{t('notifications.empty')}</p>
                  <p className="text-gray-300 text-[10px] uppercase font-bold tracking-widest">{t('notifications.emptyDesc')}</p>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}