import { apiRequest } from "./client"
import type { RoomResponse } from "../types/room"

export const getRoomDetail = (id: string) => {
  return apiRequest<RoomResponse>(`/api/public/rooms/${id}`, "GET")
}