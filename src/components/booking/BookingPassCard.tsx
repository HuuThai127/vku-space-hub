import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Booking } from '../../types';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { StatusBadge } from '../common/StatusBadge';
import { formatDisplayDate } from '../../utils/dateUtils';
import { AppButton } from '../common/AppButton';

interface BookingPassCardProps {
  booking: Booking;
  onCheckIn?: () => void;
  style?: ViewStyle;
}

export const BookingPassCard: React.FC<BookingPassCardProps> = ({
  booking,
  onCheckIn,
  style,
}) => {
  const isConfirmed = booking.status === 'confirmed';

  return (
    <View style={[styles.container, style]}>
      {/* Top Banner */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTitle}>VKU SPACEHUB</Text>
          <Text style={styles.passType}>STUDENT ENTRY PASS</Text>
        </View>
        <StatusBadge status={booking.status} />
      </View>

      {/* Main Content */}
      <View style={styles.body}>
        <Text style={styles.roomName}>{booking.roomName}</Text>
        <Text style={styles.roomSubtitle}>
          Building {booking.building} • Floor {booking.floor} • {booking.roomType}
        </Text>

        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.fieldLabel}>STUDENT</Text>
            <Text style={styles.fieldValue}>{booking.userName}</Text>
            <Text style={styles.fieldSub}>{booking.userEmail}</Text>
          </View>

          <View style={styles.gridItem}>
            <Text style={styles.fieldLabel}>DATE</Text>
            <Text style={styles.fieldValue}>{formatDisplayDate(booking.date)}</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.fieldLabel}>TIME SLOT</Text>
            <Text style={styles.fieldValue}>
              {booking.startTime} - {booking.endTime}
            </Text>
            <Text style={styles.fieldSub}>Duration: {booking.durationMinutes} mins</Text>
          </View>

          <View style={styles.gridItem}>
            <Text style={styles.fieldLabel}>BOOKING CODE</Text>
            <Text style={[styles.fieldValue, styles.codeHighlight]}>
              {booking.bookingCode}
            </Text>
          </View>
        </View>
      </View>

      {/* Perforated Divider */}
      <View style={styles.perforationWrapper}>
        <View style={styles.notchLeft} />
        <View style={styles.dashedLine} />
        <View style={styles.notchRight} />
      </View>

      {/* QR Section */}
      <View style={styles.qrSection}>
        <View style={styles.qrContainer}>
          <QRCode
            value={booking.qrPayload}
            size={160}
            color={COLORS.primaryDark}
            backgroundColor={COLORS.white}
          />
        </View>
        <Text style={styles.qrInstruction}>
          Present this QR pass at the entrance scanner of {booking.roomName.split(' - ')[0]}
        </Text>

        {isConfirmed && onCheckIn ? (
          <AppButton
            title="Scan / Check In Now"
            onPress={onCheckIn}
            variant="primary"
            style={styles.checkInBtn}
          />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.lg,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 1,
  },
  passType: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginTop: 2,
  },
  body: {
    padding: SPACING.xl,
  },
  roomName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  roomSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: SPACING.lg,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  gridItem: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  fieldSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  codeHighlight: {
    color: COLORS.primary,
  },
  perforationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    height: 24,
    overflow: 'hidden',
  },
  notchLeft: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    marginLeft: -12,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  notchRight: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    marginRight: -12,
  },
  qrSection: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: '#FAFCFE',
  },
  qrContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  qrInstruction: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 18,
    paddingHorizontal: SPACING.md,
  },
  checkInBtn: {
    width: '100%',
    marginTop: SPACING.lg,
  },
});
