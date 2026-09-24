import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { EmptyState } from '../../components/common/EmptyState';
import { useNotificationStore } from '../../store/useNotificationStore';
import { NotificationItem } from '../../types';

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const notifications = useNotificationStore((s) => s.notifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);

  const getIconConfig = (type: NotificationItem['type']) => {
    switch (type) {
      case 'booking_created':
        return {
          name: 'calendar' as const,
          color: COLORS.primary,
          bg: COLORS.primaryLight,
        };
      case 'booking_reminder':
        return {
          name: 'alarm' as const,
          color: COLORS.secondary,
          bg: COLORS.secondaryLight,
        };
      case 'check_in_success':
        return {
          name: 'checkmark-circle' as const,
          color: COLORS.available,
          bg: COLORS.availableBg,
        };
      case 'booking_cancelled':
        return {
          name: 'close-circle' as const,
          color: COLORS.maintenance,
          bg: COLORS.maintenanceBg,
        };
      default:
        return {
          name: 'notifications' as const,
          color: COLORS.primary,
          bg: COLORS.primaryLight,
        };
    }
  };

  const handleNotificationPress = (item: NotificationItem) => {
    markAsRead(item.id);
    if (item.bookingId) {
      navigation.navigate('BookingPass', { bookingId: item.bookingId });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notification Center</Text>
          <Text style={styles.subtitle}>
            Booking confirmations, check-in receipts, and reminders
          </Text>
        </View>

        {notifications.some((n) => !n.read) ? (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const iconConfig = getIconConfig(item.type);
          return (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => handleNotificationPress(item)}
              style={[
                styles.itemCard,
                !item.read && styles.itemCardUnread,
              ]}
            >
              <View style={[styles.iconWrapper, { backgroundColor: iconConfig.bg }]}>
                <Ionicons
                  name={iconConfig.name}
                  size={20}
                  color={iconConfig.color}
                />
              </View>

              <View style={styles.content}>
                <View style={styles.titleRow}>
                  <Text
                    style={[
                      styles.itemTitle,
                      !item.read && styles.itemTitleUnread,
                    ]}
                  >
                    {item.title}
                  </Text>
                  {!item.read ? <View style={styles.unreadDot} /> : null}
                </View>

                <Text style={styles.messageText}>{item.message}</Text>
                <Text style={styles.timeText}>{item.timestamp}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            title="No Notifications"
            message="You are all caught up! New reservation reminders and updates will show up here."
            icon="notifications-off-outline"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingTop: SPACING.xl + 10,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    maxWidth: 240,
  },
  markAllBtn: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  markAllText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: SPACING.lg,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  itemCardUnread: {
    backgroundColor: '#F0F7FF',
    borderColor: '#BAE6FD',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  itemTitleUnread: {
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  messageText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
    fontWeight: '500',
  },
});
