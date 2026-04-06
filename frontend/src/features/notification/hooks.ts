import { useState, useCallback, useMemo } from 'react';
import { notificationService } from './services';
import type { Notification } from './types';
import toast from 'react-hot-toast';

export const useNotificationFeature = () => {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await notificationService.getNotifications();
      setNotifications(response.data);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err: any) {
      toast.error(err.message || 'Cập nhật trạng thái thất bại');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('Đã đọc tất cả thông báo');
    } catch (err: any) {
      toast.error(err.message || 'Cập nhật trạng thái thất bại');
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Đã xóa thông báo');
    } catch (err: any) {
      toast.error(err.message || 'Xóa thông báo thất bại');
    }
  }, []);

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.isRead).length
  , [notifications]);

  return {
    loading,
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
