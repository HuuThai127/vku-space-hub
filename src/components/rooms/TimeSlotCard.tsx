import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TimeSlot } from '../../types';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

interface TimeSlotCardProps {
  slot: TimeSlot;
  isBooked: boolean;
  isSelected: boolean;
  onSelect: (slot: TimeSlot) => void;
  style?: ViewStyle;
}

export const TimeSlotCard: React.FC<TimeSlotCardProps> = ({
  slot,
  isBooked,
  isSelected,
  onSelect,
  style,
}) => {
  const getContainerStyle = () => {
    if (isBooked) return styles.slotBooked;
    if (isSelected) return styles.slotSelected;
    return styles.slotAvailable;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isBooked}
      onPress={() => onSelect(slot)}
      style={[styles.container, getContainerStyle(), style]}
    >
      <View style={styles.leftRow}>
        <View
          style={[
            styles.iconWrapper,
            isBooked
              ? styles.iconWrapperBooked
              : isSelected
              ? styles.iconWrapperSelected
              : styles.iconWrapperAvailable,
          ]}
        >
          <Ionicons
            name={
              isBooked
                ? 'close-circle'
                : isSelected
                ? 'checkmark-circle'
                : 'time-outline'
            }
            size={18}
            color={
              isBooked
                ? COLORS.maintenance
                : isSelected
                ? COLORS.white
                : COLORS.primary
            }
          />
        </View>

        <View style={styles.info}>
          <Text
            style={[
              styles.timeLabel,
              isBooked
                ? styles.textBooked
                : isSelected
                ? styles.textSelected
                : styles.textAvailable,
            ]}
          >
            {slot.label}
          </Text>
          <Text
            style={[
              styles.durationText,
              isSelected ? styles.durationSelected : styles.durationNormal,
            ]}
          >
            2 hours • Discrete Session
          </Text>
        </View>
      </View>

      <View style={styles.badge}>
        <Text
          style={[
            styles.badgeText,
            isBooked
              ? styles.badgeTextBooked
              : isSelected
              ? styles.badgeTextSelected
              : styles.badgeTextAvailable,
          ]}
        >
          {isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    marginBottom: SPACING.sm,
  },
  slotAvailable: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
  },
  slotSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  slotBooked: {
    backgroundColor: '#F8FAFC',
    borderColor: COLORS.borderLight,
    opacity: 0.65,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  iconWrapperAvailable: {
    backgroundColor: COLORS.primaryLight,
  },
  iconWrapperSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconWrapperBooked: {
    backgroundColor: COLORS.maintenanceBg,
  },
  info: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  textAvailable: {
    color: COLORS.textPrimary,
  },
  textSelected: {
    color: COLORS.white,
  },
  textBooked: {
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  durationText: {
    fontSize: 12,
    marginTop: 2,
  },
  durationNormal: {
    color: COLORS.textSecondary,
  },
  durationSelected: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  badgeTextAvailable: {
    color: COLORS.available,
  },
  badgeTextSelected: {
    color: COLORS.white,
  },
  badgeTextBooked: {
    color: COLORS.maintenance,
  },
});
