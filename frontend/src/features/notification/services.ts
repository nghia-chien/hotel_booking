import { apiRequest } from '../../api/client';

export const notificationService = {
  getNotifications: async () => {
    return await apiRequest<any>('/api/notifications', 'GET', undefined, { auth: true });
  },

  markAsRead: async (id: string) => {
    return await apiRequest<any>(`/api/notifications/${id}/read`, 'PATCH', undefined, { auth: true });
  },

  markAllAsRead: async () => {
    return await apiRequest<any>('/api/notifications/read-all', 'PATCH', undefined, { auth: true });
  },

  deleteNotification: async (id: string) => {
    return await apiRequest<any>(`/api/notifications/${id}`, 'DELETE', undefined, { auth: true });
  }
};
