import { apiRequest } from "./client"

export interface DashboardStats {
  todayBookings: number
  todayRevenue: number
  occupancyRate: number
  pendingBookings: number
  last7DaysRevenue: Array<{ date: string; revenue: number }>
  recentBookings: Array<{
    id: string
    guestName: string
    room: string
    status: string
  }>
}

export interface DashboardStatsResponse {
  success: boolean
  data: DashboardStats
}

export const getDashboardStats = () =>
  apiRequest<DashboardStatsResponse>("/api/admin/dashboard/stats", "GET", undefined, { auth: true })

// ── Bookings ──
export interface Booking {
  _id: string;
  status: string;
  paymentStatus: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
}

export const getAdminBookings = () =>
  apiRequest<{ success: boolean; data: Booking[] }>("/api/bookings", "GET", undefined, { auth: true });

export const checkInBooking = (id: string) =>
  apiRequest(`/api/bookings/${id}/check-in`, "POST", null, { auth: true });

export const checkOutBooking = (id: string) =>
  apiRequest(`/api/bookings/${id}/check-out`, "POST", null, { auth: true });

export const cancelBooking = (id: string) =>
  apiRequest(`/api/bookings/${id}/cancel`, "POST", {}, { auth: true });

// ── Calendar ──
export interface CalendarData {
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

export const getCalendarBookings = (startDate: string, endDate: string) =>
  apiRequest<{ success: boolean; data: CalendarData[] }>(
    `/api/admin/bookings/calendar?startDate=${startDate}&endDate=${endDate}`,
    "GET",
    undefined,
    { auth: true }
  );

// ── Users ──
export interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  role: "user" | "admin" | "staff";
  isActive: boolean;
  createdAt: string;
}

export const getAdminUsers = (page: number, limit: number, search: string) =>
  apiRequest<{ success: boolean; data: AdminUser[]; totalCount: number }>(
    `/api/admin/users?page=${page}&limit=${limit}&search=${search}`,
    "GET",
    undefined,
    { auth: true }
  );

export const updateUserRole = (userId: string, role: string) =>
  apiRequest(`/api/admin/users/${userId}/role`, "PATCH", { role }, { auth: true });

export const updateUserStatus = (userId: string, isActive: boolean) =>
  apiRequest(`/api/admin/users/${userId}/status`, "PATCH", { isActive }, { auth: true });
