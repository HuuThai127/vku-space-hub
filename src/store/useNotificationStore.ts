import { create } from 'zustand';
import { NotificationItem, NotificationType } from '../types';
import { storageService } from '../services/storageService';

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
      const list = await storageService.getNotifications();
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
  },

  markAllAsRead: async () => {
    const updated = get().notifications.map((n) => ({ ...n, read: true }));
    set({ notifications: updated, unreadCount: 0 });
    await storageService.saveNotifications(updated);
  },

  addNotification: async (
    type: NotificationType,
    title: string,
    message: string,
    bookingId?: string,
    bookingCode?: string
  ) => {
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
  },
}));
