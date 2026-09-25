import { create } from 'zustand';
import { NotificationItem, NotificationType } from '../types';
import { notificationService } from '../services/notificationService';
import { storageService } from '../services/storageService';
import { useBookingStore } from './useBookingStore';

interface NotificationStore {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (
    type: NotificationType,
    title: string,
    message: string,
    bookingId?: string,
    bookingCode?: string
  ) => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const user = useBookingStore.getState().user;
      const list = await notificationService.fetchUserNotifications(user?.id);
      const unreadCount = list.filter((n) => !n.read).length;
      set({ notifications: list, unreadCount, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  markAsRead: async (id: string) => {
    const updated = get().notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    const unreadCount = updated.filter((n) => !n.read).length;
    set({ notifications: updated, unreadCount });
    await storageService.saveNotifications(updated);
    await notificationService.markAsRead(id);
  },

  markAllAsRead: async () => {
    const user = useBookingStore.getState().user;
    const updated = get().notifications.map((n) => ({ ...n, read: true }));
    set({ notifications: updated, unreadCount: 0 });
    await storageService.saveNotifications(updated);
    await notificationService.markAllAsRead(user?.id);
  },

  addNotification: async (
    type: NotificationType,
    title: string,
    message: string,
    bookingId?: string,
    bookingCode?: string
  ) => {
    const user = useBookingStore.getState().user;
    const newItem: NotificationItem = {
      id: `notif-${Date.now()}`,
      type,
      title,
      message,
      timestamp: 'Just now',
      read: false,
      bookingId,
      bookingCode,
    };
    const updated = [newItem, ...get().notifications];
    const unreadCount = updated.filter((n) => !n.read).length;
    set({ notifications: updated, unreadCount });
    await storageService.saveNotifications(updated);

    if (user?.id) {
      await notificationService.createNotificationRecord({
        userId: user.id,
        type,
        title,
        message,
        bookingId,
        bookingCode,
      });
    }
  },
}));
