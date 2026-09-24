import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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

export const notificationService = {
  /**
   * Request notification permissions gracefully
   */
  async requestPermissions(): Promise<boolean> {
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
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('Notification permission not granted, continuing without push.');
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
        triggerSeconds = 5; // Demo trigger in 5 seconds
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
    if (!notificationId) return;
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (e) {
      console.warn('Failed to cancel scheduled notification:', e);
    }
  },
};
