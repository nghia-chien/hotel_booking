import { useState, useCallback } from 'react';
import { bookingService } from './services';
import type { Booking, BookingFilter, CreateBookingDTO } from './types';
import toast from 'react-hot-toast';

export const useBookingFeature = () => {
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);

  const fetchMyBookings = useCallback(async (filter?: BookingFilter) => {
    setLoading(true);
    try {
      const response = await bookingService.getMyBookings(filter);
      setBookings(response.data);
      setTotal(response.meta?.total || response.data.length);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải danh sách đặt phòng');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBookingDetail = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await bookingService.getBookingDetail(id);
      setCurrentBooking(response.data);
      return response.data;
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải chi tiết đặt phòng');
    } finally {
      setLoading(false);
    }
  }, []);

  const createNewBooking = useCallback(async (data: CreateBookingDTO) => {
    setLoading(true);
    try {
      const response = await bookingService.createBooking(data);
      toast.success('Đặt phòng thành công!');
      return response.data;
    } catch (err: any) {
      toast.error(err.message || 'Đặt phòng thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelBooking = useCallback(async (id: string, reason: string) => {
    setLoading(true);
    try {
      await bookingService.cancelBooking(id, reason);
      toast.success('Hủy đặt phòng thành công');
      // Update local state if current booking is the one cancelled
      if (currentBooking && currentBooking.id === id) {
        setCurrentBooking({ ...currentBooking, status: 'cancelled' });
      }
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)));
    } catch (err: any) {
      toast.error(err.message || 'Hủy đặt phòng thất bại');
    } finally {
      setLoading(false);
    }
  }, [currentBooking]);

  return {
    loading,
    bookings,
    total,
    currentBooking,
    fetchMyBookings,
    fetchBookingDetail,
    createNewBooking,
    cancelBooking,
  };
};
