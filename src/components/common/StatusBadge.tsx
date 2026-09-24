import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { BookingStatus, RoomStatus } from '../../types';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

interface StatusBadgeProps {
  status: RoomStatus | BookingStatus;
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, style }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'Available Now':
        return {
          label: 'Available Now',
          bg: COLORS.availableBg,
          text: COLORS.available,
          border: COLORS.availableBorder,
          dot: COLORS.available,
        };
      case 'Occupied':
        return {
          label: 'Occupied',
          bg: COLORS.occupiedBg,
          text: COLORS.occupied,
          border: COLORS.occupiedBorder,
          dot: COLORS.occupied,
        };
      case 'Maintenance':
        return {
          label: 'Maintenance',
          bg: COLORS.maintenanceBg,
          text: COLORS.maintenance,
          border: COLORS.maintenanceBorder,
          dot: COLORS.maintenance,
        };
      case 'confirmed':
        return {
          label: 'Confirmed',
          bg: COLORS.availableBg,
          text: COLORS.available,
          border: COLORS.availableBorder,
          dot: COLORS.available,
        };
      case 'checked_in':
        return {
          label: 'Checked In',
          bg: COLORS.checkedInBg,
          text: COLORS.checkedIn,
          border: '#BFDBFE',
          dot: COLORS.checkedIn,
        };
      case 'completed':
        return {
          label: 'Completed',
          bg: '#F1F5F9',
          text: COLORS.textSecondary,
          border: '#CBD5E1',
          dot: COLORS.textMuted,
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          bg: COLORS.maintenanceBg,
          text: COLORS.maintenance,
          border: COLORS.maintenanceBorder,
          dot: COLORS.maintenance,
        };
      default:
        return {
          label: String(status),
          bg: '#F1F5F9',
          text: COLORS.textSecondary,
          border: '#CBD5E1',
          dot: COLORS.textMuted,
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
        },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.dot }]} />
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
