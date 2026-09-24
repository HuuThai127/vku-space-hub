import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { RootStackScreenProps } from '../../navigation/types';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AppButton } from '../../components/common/AppButton';
import { useBookingStore } from '../../store/useBookingStore';
import { formatDisplayDate } from '../../utils/dateUtils';

export const QRCheckInScreen: React.FC<RootStackScreenProps<'QRCheckIn'>> = ({
  route,
  navigation,
}) => {
  const { bookingId } = route.params;

  const [loading, setLoading] = useState(false);

  const booking = useBookingStore((s) =>
    s.allCampusBookings.find((b) => b.id === bookingId)
  );
  const checkIn = useBookingStore((s) => s.checkIn);

  if (!booking) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Booking not found.</Text>
        <AppButton title="Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const isConfirmed = booking.status === 'confirmed';
  const isCheckedIn = booking.status === 'checked_in';

  const handleSimulateCheckIn = async () => {
    if (!isConfirmed) {
      if (booking.status === 'cancelled') {
        Alert.alert('Check-In Disallowed', 'Cannot check in to a cancelled reservation.');
      } else if (booking.status === 'completed') {
        Alert.alert('Check-In Disallowed', 'This reservation is already completed.');
      }
      return;
    }

    try {
      setLoading(true);
      await checkIn(booking.id);
      setLoading(false);
      Alert.alert(
        'Check-In Successful! 🎉',
        `Welcome to ${booking.roomName}. Your status has been updated to Checked In.`
      );
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Check-in Failed', err.message || 'Unable to complete check-in.');
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Interactive QR Check-In"
        subtitle={booking.bookingCode}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Scan this QR to Check In</Text>
          <Text style={styles.subtitle}>
            Hold your phone screen against the scanner at {booking.roomName.split(' - ')[0]}
          </Text>

          {/* QR Code Container */}
          <View style={styles.qrContainer}>
            <QRCode
              value={booking.qrPayload}
              size={200}
              color={COLORS.primaryDark}
              backgroundColor={COLORS.white}
            />
          </View>

          {/* Details */}
          <View style={styles.metaRow}>
            <Text style={styles.codeText}>{booking.bookingCode}</Text>
            <StatusBadge status={booking.status} />
          </View>

          <View style={styles.detailsBox}>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>
                {booking.roomName} (Bldg {booking.building}, Fl {booking.floor})
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>{formatDisplayDate(booking.date)}</Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={16} color={COLORS.secondary} />
              <Text style={styles.detailText}>
                {booking.startTime} - {booking.endTime} ({booking.durationMinutes} mins)
              </Text>
            </View>

            {booking.checkedInAt ? (
              <View style={styles.detailItem}>
                <Ionicons name="checkmark-done" size={16} color={COLORS.available} />
                <Text style={styles.detailText}>
                  Checked in at: {new Date(booking.checkedInAt).toLocaleTimeString()}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Action Simulation for Academic Grading Demo */}
          <View style={styles.actionSection}>
            {isCheckedIn ? (
              <View style={styles.checkedInBanner}>
                <Ionicons name="checkmark-circle" size={24} color={COLORS.available} />
                <Text style={styles.checkedInText}>Attendance Verified & Active</Text>
              </View>
            ) : (
              <AppButton
                title={loading ? 'Verifying...' : 'Simulate Scanner Check-In'}
                onPress={handleSimulateCheckIn}
                loading={loading}
                disabled={!isConfirmed || loading}
                variant="primary"
                icon={<Ionicons name="scan" size={20} color={COLORS.white} />}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  scrollContent: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.sm,
  },
  qrContainer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  codeText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  detailsBox: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: SPACING.sm,
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  actionSection: {
    width: '100%',
  },
  checkedInBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.availableBg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.availableBorder,
  },
  checkedInText: {
    marginLeft: SPACING.sm,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.available,
  },
});
