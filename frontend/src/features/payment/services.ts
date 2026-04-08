import { apiRequest } from '../../api/client';


export const paymentService = {
  createVNPayOrder: async (bookingIds: string[]) => {
    return await apiRequest<any>('/api/payments/vnpay/create-order', 'POST', { bookingIds }, { auth: true });
  },

  getMyPayments: async () => {
    return await apiRequest<any>('/api/payments/my', 'GET', undefined, { auth: true });
  },

  getPaymentDetail: async (id: string) => {
    return await apiRequest<any>(`/api/payments/${id}`, 'GET', undefined, { auth: true });
  },

  refundVNPay: async (paymentId: string, refundAmount?: number) => {
    return await apiRequest<any>('/api/payments/vnpay/refund', 'POST', { paymentId, refundAmount }, { auth: true });
  }
};
