import { apiRequest } from '../../api/client';
import type { SearchParams } from './types';

export const roomService = {
  getRooms: async (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiRequest<any>(`/api/rooms${query ? `?${query}` : ''}`, 'GET');
  },

  getRoomDetail: async (id: string) => {
    return await apiRequest<any>(`/api/rooms/${id}`, 'GET');
  },

  getRoomTypes: async () => {
    return await apiRequest<any>('/api/room-types', 'GET');
  },

  searchRooms: async (queryString: string) => {
    return await apiRequest<any>(`/api/bookings/search?${queryString}`, 'GET');
  },

  checkAvailability: async (params: SearchParams & { roomId?: string }) => {
    const query = new URLSearchParams({
      checkIn: params.checkIn instanceof Date ? params.checkIn.toISOString() : params.checkIn,
      checkOut: params.checkOut instanceof Date ? params.checkOut.toISOString() : params.checkOut,
      guests: String(params.guests),
      ...(params.roomId ? { roomId: params.roomId } : {}),
    }).toString();
    return await apiRequest<any>(`/api/bookings/search?${query}`, 'GET');
  },
};
