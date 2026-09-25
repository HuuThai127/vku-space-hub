import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationItem, NotificationType } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { storageService } from './storageService';

// Configure default notification presentation
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function formatRelativeTime(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
}

export const notificationService = {
  /**
   * Request notification permissions gracefully (native device push)
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false; // Graceful web fallback
    }
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } catch (e) {
      console.warn('Could not request notification permissions:', e);
      return false;
    }
  },

  /**
   * Schedules a reminder notification 15 minutes before the booking start time.
   * If the calculated reminder time is already in the past, schedule it 5 seconds from now for demo verification.
   */
  async scheduleBookingReminder(
    roomName: string,
    dateStr: string,
    startTimeStr: string
  ): Promise<string | undefined> {
    if (Platform.OS === 'web') {
      return undefined;
    }
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return undefined;
      }

      // Calculate target trigger date
      const [year, month, day] = dateStr.split('-').map(Number);
      const [hours, minutes] = startTimeStr.split(':').map(Number);

      const bookingStart = new Date(year, month - 1, day, hours, minutes, 0);
      const reminderTime = new Date(bookingStart.getTime() - 15 * 60 * 1000); // 15 mins prior
      const now = new Date();

      let triggerSeconds = Math.floor((reminderTime.getTime() - now.getTime()) / 1000);

      // If scheduled time has already passed or is within 2 minutes, schedule shortly for demo verification
      if (triggerSeconds <= 0) {
        triggerSeconds = 5;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'VKU SpaceHub Reminder',
          body: `Your booking at Room ${roomName} starts in 15 minutes.`,
          data: { roomName, date: dateStr, startTime: startTimeStr },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: triggerSeconds,
        },
      });

      return notificationId;
    } catch (error) {
      console.warn('Failed to schedule local notification:', error);
      return undefined;
    }
  },

  /**
   * Cancels a previously scheduled notification
   */
  async cancelNotification(notificationId?: string): Promise<void> {
    if (!notificationId || Platform.OS === 'web') return;
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (e) {
      console.warn('Failed to cancel scheduled notification:', e);
    }
  },

  /**
   * Fetches notification history from Supabase for a given user ID
   */
  async fetchUserNotifications(userId?: string): Promise<NotificationItem[]> {
    if (isSupabaseConfigured() && userId) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select(`
            id,
            type,
            title,
            message,
            is_read,
            created_at,
            booking_id,
            booking:bookings(booking_code)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: NotificationItem[] = data.map((item: any) => ({
            id: item.id,
            type: item.type as NotificationType,
            title: item.title,
            message: item.message,
            timestamp: formatRelativeTime(item.created_at),
            read: item.is_read,
            bookingId: item.booking_id,
            bookingCode: item.booking?.booking_code,
          }));

          await storageService.saveNotifications(mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Error fetching notifications from Supabase:', err);
      }
    }

    return await storageService.getNotifications();
  },

  /**
   * Marks a notification as read in Supabase
   */
  async markAsRead(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', id);
      } catch (e) {
        console.warn('Failed to mark notification as read in Supabase:', e);
      }
    }
  },

  /**
   * Marks all notifications as read in Supabase for a user
   */
  async markAllAsRead(userId?: string): Promise<void> {
    if (isSupabaseConfigured() && userId) {
      try {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', userId);
      } catch (e) {
        console.warn('Failed to mark all notifications as read in Supabase:', e);
      }
    }
  },

  /**
   * Stores a notification record in Supabase
   */
  async createNotificationRecord(params: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    bookingId?: string;
    bookingCode?: string;
  }): Promise<NotificationItem> {
    const { userId, type, title, message, bookingId, bookingCode } = params;

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            booking_id: bookingId || null,
            title,
            message,
            type,
            is_read: false,
          })
          .select()
          .single();

        if (!error && data) {
          return {
            id: data.id,
            type: data.type as NotificationType,
            title: data.title,
            message: data.message,
            timestamp: 'Just now',
            read: false,
            bookingId: data.booking_id,
            bookingCode,
          };
        }
      } catch (e) {
        console.warn('Failed to insert notification into Supabase:', e);
      }
    }

    return {
      id: `notif-${Date.now()}`,
      type,
      title,
      message,
      timestamp: 'Just now',
      read: false,
      bookingId,
      bookingCode,
    };
  },
};
