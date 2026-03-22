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
