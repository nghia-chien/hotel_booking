import { apiRequest } from '../../api/client';
import type { BookingFilter, CreateBookingDTO } from './types';

export const bookingService = {
  searchRooms: async (params: string) => {
    return await apiRequest<any>(`/api/bookings/search?${params}`, 'GET');
  },

  createBooking: async (data: CreateBookingDTO) => {
    return await apiRequest<any>('/api/bookings', 'POST', data, { auth: true });
  },

  getMyBookings: async (filter: BookingFilter = {}) => {
    const query = new URLSearchParams(filter as any).toString();
    const url = `/api/bookings/my${query ? `?${query}` : ''}`;
    return await apiRequest<any>(url, 'GET', undefined, { auth: true });
  },

  getBookingDetail: async (id: string) => {
    return await apiRequest<any>(`/api/bookings/${id}`, 'GET', undefined, { auth: true });
  },

  cancelBooking: async (id: string, reason: string) => {
    return await apiRequest<any>(`/api/bookings/${id}/cancel`, 'POST', { reason }, { auth: true });
  },

  getAllBookingsAdmin: async (page = 1, limit = 10, filter: any = {}) => {
    const queryParams = new URLSearchParams({ page: page.toString(), limit: limit.toString(), ...filter });
    return await apiRequest<any>(`/api/bookings/admin/all?${queryParams}`, 'GET', undefined, { auth: true });
  },

  updateBookingStatus: async (id: string, status: string) => {
    return await apiRequest<any>(`/api/bookings/admin/${id}/status`, 'PATCH', { status }, { auth: true });
  }
};
