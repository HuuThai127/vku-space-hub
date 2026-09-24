import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Booking } from '../../types';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { StatusBadge } from '../common/StatusBadge';
import { AppButton } from '../common/AppButton';
import { formatDisplayDate } from '../../utils/dateUtils';

interface BookingCardProps {
  booking: Booking;
  onViewPass: (booking: Booking) => void;
  onCheckIn?: (booking: Booking) => void;
  onCancel?: (booking: Booking) => void;
  style?: ViewStyle;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onViewPass,
  onCheckIn,
  onCancel,
  style,
}) => {
  const isConfirmed = booking.status === 'confirmed';
  const isCheckedIn = booking.status === 'checked_in';

  const handleCancelPress = () => {
    if (!onCancel) return;
    Alert.alert(
      'Cancel Reservation',
      `Are you sure you want to cancel your reservation for ${booking.roomName} on ${booking.date}? This will make the slot available for other students.`,
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => onCancel(booking),
        },
      ]
    );
  };

  return (
    <View style={[styles.card, style]}>
      {/* Header Row: Room & Status */}
      <View style={styles.topRow}>
        <Image
          source={{ uri: booking.roomPhoto }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.roomMeta}>
          <Text style={styles.bookingCode}>{booking.bookingCode}</Text>
          <Text style={styles.roomName} numberOfLines={1}>
            {booking.roomName}
          </Text>
          <Text style={styles.locationText}>
            Building {booking.building} • Floor {booking.floor} • {booking.roomType}
          </Text>
        </View>
        <StatusBadge status={booking.status} />
      </View>

      <View style={styles.divider} />

      {/* Date & Time Grid */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
          <View style={styles.detailTextContainer}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>
              {formatDisplayDate(booking.date)}
            </Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color={COLORS.secondary} />
          <View style={styles.detailTextContainer}>
            <Text style={styles.detailLabel}>Time Slot</Text>
            <Text style={styles.detailValue}>
              {booking.startTime} - {booking.endTime}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <AppButton
          title="View Pass"
          onPress={() => onViewPass(booking)}
          variant="outline"
          size="sm"
          icon={<Ionicons name="qr-code-outline" size={16} color={COLORS.primary} />}
          style={styles.actionBtn}
        />

        {isConfirmed && onCheckIn ? (
          <AppButton
            title="Check In"
            onPress={() => onCheckIn(booking)}
            variant="primary"
            size="sm"
            icon={<Ionicons name="scan-outline" size={16} color={COLORS.white} />}
            style={styles.actionBtn}
          />
        ) : null}

        {isConfirmed && onCancel ? (
          <AppButton
            title="Cancel"
            onPress={handleCancelPress}
            variant="ghost"
            size="sm"
            textStyle={{ color: COLORS.maintenance }}
            style={styles.cancelBtn}
          />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.border,
  },
  roomMeta: {
    flex: 1,
    marginLeft: SPACING.md,
    marginRight: SPACING.xs,
  },
  bookingCode: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  roomName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailTextContainer: {
    marginLeft: SPACING.sm,
  },
  detailLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  actionBtn: {
    flex: 1,
  },
  cancelBtn: {
    paddingHorizontal: SPACING.sm,
  },
});
