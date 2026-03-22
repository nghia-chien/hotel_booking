import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import type { View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { vi } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { apiRequest } from "../../api/client";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Info,
  ExternalLink,
  Loader2,
  X
} from "lucide-react";

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
  Confirmed: "#1D9E75",
  Pending: "#BA7517",
  Cancelled: "#E24B4A",
  CheckedIn: "#2563EB",
  CheckedOut: "#6B7280",
};

export default function AdminCalendar() {
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>("month");
  const [selectedEvent, setSelectedEvent] = useState<BookingEvent | null>(null);

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
            title: `[${room.roomNumber}] - ${booking.guestName}`,
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
    fetchBookings(currentDate, view);
  }, [currentDate, view, fetchBookings]);

  const eventStyleGetter = (event: BookingEvent) => {
    const backgroundColor = statusColors[event.status] || "#6B7280";
    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.95,
        color: "white",
        border: "none",
        display: "block",
        fontSize: "12px",
        padding: "2px 4px"
      }
    };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch đặt phòng</h1>
          <p className="text-gray-500 text-sm">Tổng quan tình trạng phòng theo thời gian.</p>
        </div>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
          <div className="flex bg-white rounded-xl border border-gray-100 shadow-sm p-1">
            {(["month", "week", "day"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                  view === v 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                  : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {v === "month" ? "Tháng" : v === "week" ? "Tuần" : "Ngày"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 h-[750px] relative overflow-hidden">
        <style>{`
          .rbc-calendar { font-family: inherit; }
          .rbc-header { padding: 10px; font-weight: bold; font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; }
          .rbc-event { transition: transform 0.2s; }
          .rbc-event:hover { transform: scale(1.02); z-index: 10; }
          .rbc-today { background-color: #F8FAFC; }
          .rbc-off-range-bg { background-color: #F1F5F9; opacity: 0.5; }
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
            next: "Tiếp",
            previous: "Trước",
            today: "Hôm nay",
            month: "Tháng",
            week: "Tuần",
            day: "Ngày",
            agenda: "Lịch trình"
          }}
          culture="vi"
        />

        {/* Popover overlay */}
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-4 flex justify-between items-center border-b border-gray-50 bg-gray-50/50">
                <h3 className="font-bold text-gray-900">Chi tiết đặt phòng</h3>
                <button onClick={() => setSelectedEvent(null)} className="p-1.5 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-black tracking-widest text-blue-600">Phòng {selectedEvent.roomNumber} ({selectedEvent.roomName})</div>
                  <div className="text-xl font-black text-gray-900">{selectedEvent.guestName}</div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm py-2 px-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-400 font-bold uppercase text-[10px]">Thời gian</span>
                    <span className="font-bold">
                      {format(selectedEvent.start, "dd/MM")} - {format(selectedEvent.end, "dd/MM/yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm py-2 px-3 bg-gray-50 rounded-xl">
                     <span className="text-gray-400 font-bold uppercase text-[10px]">Trạng thái</span>
                     <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase text-white" style={{ backgroundColor: statusColors[selectedEvent.status] }}>
                        {selectedEvent.status}
                     </span>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <Link 
                    to={`/admin/bookings/${selectedEvent.id}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-center text-sm shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
                    onClick={() => setSelectedEvent(null)}
                  >
                    Xem booking <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
