import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import type { View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { vi } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { apiRequest } from "../../api/client";
import { cn } from "../../components/ui/utils";
import { useData } from "../../context/DataContext";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Info,
  ExternalLink,
  Loader2,
  X,
  Clock,
  User,
  Zap
} from "lucide-react";
import { StatusBadge, AdminPageHeader } from "../../components/admin";

const locales = {
  "vi": vi,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface BookingEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: string;
  guestName: string;
  roomNumber: string;
  roomName: string;
}

interface CalendarData {
  roomId: string;
  roomName: string;
  roomNumber: string;
  bookings: {
    bookingId: string;
    guestName: string;
    checkIn: string;
    checkOut: string;
    status: string;
  }[];
}

const statusColors: Record<string, string> = {
  Confirmed: "#10B981", // emerald-500
  Pending: "#F59E0B",  // amber-500
  Cancelled: "#EF4444", // red-500
  CheckedIn: "#3B82F6", // blue-500
  CheckedOut: "#6B7280", // gray-500
};

export default function AdminCalendar() {
  const { calendarState, setCalendarState } = useData();
  const { currentDate, view } = calendarState;

  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<BookingEvent | null>(null);

  const setCurrentDate = (date: Date) => setCalendarState({ ...calendarState, currentDate: date });
  const setView = (v: View) => setCalendarState({ ...calendarState, view: v });

  const fetchBookings = useCallback(async (date: Date, currentView: View) => {
    setLoading(true);
    try {
      let start = new Date(date);
      let end = new Date(date);

      if (currentView === "month") {
        start = new Date(date.getFullYear(), date.getMonth(), 1);
        end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      } else if (currentView === "week") {
        const startDay = start.getDate() - start.getDay();
        start = new Date(date.getFullYear(), date.getMonth(), startDay, 0, 0, 0, 0);
        end = new Date(date.getFullYear(), date.getMonth(), startDay + 6, 23, 59, 59, 999);
      } else {
        start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
        end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
      }

      const res = await apiRequest<{ success: boolean; data: CalendarData[] }>(
        `/api/admin/bookings/calendar?startDate=${start.toISOString()}&endDate=${end.toISOString()}`,
        "GET",
        undefined,
        { auth: true }
      );

      const allEvents: BookingEvent[] = [];
      res.data.forEach(room => {
        room.bookings.forEach(booking => {
          allEvents.push({
            id: booking.bookingId,
            title: `${room.roomNumber} - ${booking.guestName}`,
            start: new Date(booking.checkIn),
            end: new Date(booking.checkOut),
            status: booking.status,
            guestName: booking.guestName,
            roomNumber: room.roomNumber,
            roomName: room.roomName
          });
        });
      });

      setEvents(allEvents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchBookings(currentDate, view);
  }, [currentDate, view, fetchBookings]);

  const eventStyleGetter = (event: BookingEvent) => {
    const backgroundColor = statusColors[event.status] || "#6B7280";
    return {
      style: {
        backgroundColor,
        borderRadius: "8px",
        opacity: 0.9,
        color: "white",
        border: "none",
        display: "block",
        fontSize: "10px",
        fontWeight: "bold",
        padding: "4px 8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        textTransform: "uppercase" as const,
        letterSpacing: "0.025em"
      }
    };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-6 animate-in fade-in duration-500 pb-20 mt-12">
      {/* Header */}
      <AdminPageHeader
        eyebrow="Quản lý vận hành"
        title="Lịch Booking"
        subtitle="Theo dõi tình trạng trống/đầy phòng, quản lý lịch check-in/check-out trực quan."
        actions={
          <>
            {loading && <Loader2 className="w-5 h-5 animate-spin text-[var(--color-primary-dark)]" />}
            <div className="flex bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-1 shadow-sm">
              {(["month", "week", "day"] as View[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    view === v 
                    ? "bg-black text-white shadow-lg" 
                    : "text-[var(--color-text-secondary)] hover:bg-gray-200"
                  )}
                >
                  {v === "month" ? "Tháng" : v === "week" ? "Tuần" : "Ngày"}
                </button>
              ))}
            </div>
          </>
        }
      />

      {/* Calendar Wrap */}
      <div className="bg-white rounded-[40px] border border-[var(--color-border)] shadow-[var(--shadow-lg)] p-8 h-[800px] relative overflow-hidden">
        <style>{`
          .rbc-calendar { font-family: inherit; }
          .rbc-header { padding: 15px 10px; font-weight: 800; font-size: 10px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.15em; border-bottom: 2px solid var(--color-surface); }
          .rbc-month-view { border: 1px solid var(--color-surface); border-radius: 20px; overflow: hidden; }
          .rbc-day-bg { border-left: 1px solid var(--color-surface); }
          .rbc-month-row { border-top: 1px solid var(--color-surface); }
          .rbc-today { background-color: rgba(200, 240, 0, 0.05); }
          .rbc-off-range-bg { background-color: #F9FAFB; opacity: 0.6; }
          .rbc-event { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
          .rbc-event:hover { transform: translateY(-2px); z-index: 50; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
          .rbc-toolbar { margin-bottom: 25px; }
          .rbc-btn-group button { 
             border: none; 
             background: var(--color-surface); 
             border-radius: 10px !important; 
             margin: 0 4px; 
             font-size: 12px; 
             font-weight: 700; 
             padding: 8px 16px;
             color: var(--color-text-primary);
             transition: all 0.2s;
          }
          .rbc-btn-group button:hover { background: #E5E7EB; }
          .rbc-btn-group button.rbc-active { background: black; color: white; }
          .rbc-toolbar-label { font-family: 'Playfair Display', serif; font-weight: 700; font-size: 20px; color: var(--color-text-primary); }
        `}</style>
        
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          view={view}
          onView={(v) => setView(v)}
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={(event) => setSelectedEvent(event)}
          messages={{
            next: "Kế tiếp",
            previous: "Quay lại",
            today: "Hôm nay",
            month: "Tháng",
            week: "Tuần",
            day: "Ngày",
            agenda: "Danh sách"
          }}
          culture="vi"
        />

        {/* Custom Event Detail Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
              <div className="p-6 pb-2 flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center shadow-sm">
                      <Zap className="w-4 h-4 text-black" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Chi tiết đặt phòng</span>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-[var(--color-surface)] rounded-full transition-colors group">
                  <X className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-black" />
                </button>
              </div>
              
              <div className="p-8 pt-4 space-y-6">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[var(--color-text-primary)] leading-tight">
                    {selectedEvent.guestName}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                     <span className="px-2 py-0.5 bg-black text-white text-[9px] font-black rounded-md tracking-tighter uppercase font-mono">
                        ROOM {selectedEvent.roomNumber}
                     </span>
                     <span className="text-xs font-bold text-[var(--color-text-secondary)]">{selectedEvent.roomName}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between p-4 bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)]">
                    <div className="flex items-center gap-3">
                       <CalendarIcon className="w-4 h-4 text-[var(--color-text-muted)]" />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Thời gian</span>
                    </div>
                    <span className="text-xs font-black text-[var(--color-text-primary)]">
                      {format(selectedEvent.start, "dd/MM")} - {format(selectedEvent.end, "dd/MM/yyyy")}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)]">
                     <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-[var(--color-text-muted)]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Trạng thái</span>
                     </div>
                     <StatusBadge status={selectedEvent.status} variant="tag" />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <Link 
                    to={`/admin/bookings?id=${selectedEvent.id}`}
                    className="flex-1 bg-[var(--color-primary)] hover:opacity-90 text-black font-black uppercase tracking-[0.2em] py-4 rounded-2xl text-center text-[10px] shadow-lg shadow-[var(--color-primary)]/20 transition-all flex items-center justify-center gap-2"
                    onClick={() => setSelectedEvent(null)}
                  >
                    Quản lý Booking <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 p-6 bg-white rounded-3xl border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
         <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mr-2">Ghi chú:</span>
         {Object.entries(statusColors).map(([status, color]) => (
           <div key={status} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: color }}></div>
              <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">{status}</span>
           </div>
         ))}
      </div>
    </div>
  );
}
