import { useState, useCallback } from 'react';
import { paymentService } from './services';
import type { Payment } from './types';
import toast from 'react-hot-toast';

export const usePaymentFeature = () => {
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);

  const fetchMyPayments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await paymentService.getMyPayments();
      setPayments(response.data);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải lịch sử giao dịch');
    } finally {
      setLoading(false);
    }
  }, []);

  const createVNPayOrder = useCallback(async (bookingIds: string[]) => {
    setLoading(true);
    try {
      const response = await paymentService.createVNPayOrder(bookingIds);
      if (response.success && response.data?.paymentUrl) {
        return response.data.paymentUrl;
      }
      throw new Error(response.message || 'Không thể tạo yêu cầu thanh toán');
    } catch (err: any) {
      toast.error(err.message || 'Tạo giao dịch thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refundVNPay = useCallback(async (paymentId: string, refundAmount?: number) => {
    setLoading(true);
    try {
      const resp = await paymentService.refundVNPay(paymentId, refundAmount);
      toast.success('Yêu cầu hoàn tiền đã gửi');
      return resp;
    } catch (err: any) {
      toast.error(err.message || 'Hoàn tiền thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    payments,
    fetchMyPayments,
    createVNPayOrder,
    refundVNPay,
  };
};
