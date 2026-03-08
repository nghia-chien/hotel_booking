import { apiRequest } from "./client"
import type { SearchResponse, CreateBookingPayload } from "../types/room"

export const searchRooms = (params: string) =>
  apiRequest<SearchResponse>(`/api/bookings/search?${params}`, "GET")

export const createBooking = (data: CreateBookingPayload) =>
  apiRequest("/api/bookings", "POST", data)