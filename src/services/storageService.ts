import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Booking, NotificationItem } from '../types';
import { DEMO_USER, INITIAL_BOOKINGS, INITIAL_NOTIFICATIONS } from '../constants/mockData';

const KEYS = {
  USER_SESSION: '@vku_spacehub_user_session',
  BOOKINGS: '@vku_spacehub_bookings',
  NOTIFICATIONS: '@vku_spacehub_notifications',
};

export const storageService = {
  // User Session
  async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.USER_SESSION, JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to save user session', e);
    }
  },

  async getUser(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER_SESSION);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (e) {
      console.warn('Failed to load user session', e);
      return null;
    }
  },

  async clearUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.USER_SESSION);
    } catch (e) {
      console.warn('Failed to clear user session', e);
    }
  },

  // Bookings
  async getBookings(): Promise<Booking[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.BOOKINGS);
      if (data) {
        return JSON.parse(data);
      }
      // Initialize with mock data on first launch
      await this.saveBookings(INITIAL_BOOKINGS);
      return INITIAL_BOOKINGS;
    } catch (e) {
      console.warn('Failed to load bookings from storage', e);
      return INITIAL_BOOKINGS;
    }
  },

  async saveBookings(bookings: Booking[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.BOOKINGS, JSON.stringify(bookings));
    } catch (e) {
      console.warn('Failed to save bookings to storage', e);
    }
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.NOTIFICATIONS);
      if (data) {
        return JSON.parse(data);
      }
      await this.saveNotifications(INITIAL_NOTIFICATIONS);
      return INITIAL_NOTIFICATIONS;
    } catch (e) {
      console.warn('Failed to load notifications from storage', e);
      return INITIAL_NOTIFICATIONS;
    }
  },

  async saveNotifications(notifications: NotificationItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.warn('Failed to save notifications to storage', e);
    }
  },
};
