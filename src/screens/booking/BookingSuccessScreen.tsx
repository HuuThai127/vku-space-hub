import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackScreenProps } from '../../navigation/types';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { AppButton } from '../../components/common/AppButton';
import { useBookingStore } from '../../store/useBookingStore';
import { formatDisplayDate } from '../../utils/dateUtils';

export const BookingSuccessScreen: React.FC<
  RootStackScreenProps<'BookingSuccess'>
> = ({ route, navigation }) => {
  const { bookingId } = route.params;

  const booking = useBookingStore((s) =>
    s.allCampusBookings.find((b) => b.id === bookingId)
  );

  if (!booking) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Reservation details not found.</Text>
        <AppButton
          title="Return to Home"
          onPress={() => navigation.navigate('MainTabs')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Animated Celebration Icon */}
        <View style={styles.celebrationCircle}>
          <Ionicons name="checkmark" size={48} color={COLORS.white} />
        </View>

        <Text style={styles.title}>Booking Confirmed! 🎉</Text>
        <Text style={styles.subtitle}>
          Your study space has been successfully reserved.
        </Text>

        {/* Booking Summary Card */}
        <View style={styles.card}>
          <View style={styles.codeRow}>
            <Text style={styles.codeLabel}>BOOKING ID</Text>
            <Text style={styles.codeValue}>{booking.bookingCode}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Room</Text>
            <Text style={styles.itemValue}>{booking.roomName}</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Location</Text>
            <Text style={styles.itemValue}>
              Building {booking.building} • Floor {booking.floor}
            </Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Date</Text>
            <Text style={styles.itemValue}>{formatDisplayDate(booking.date)}</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Time Slot</Text>
            <Text style={styles.itemValue}>
              {booking.startTime} - {booking.endTime}
            </Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Student</Text>
            <Text style={styles.itemValue}>{booking.userName}</Text>
          </View>
        </View>

        {/* Reminder Notice */}
        <View style={styles.reminderNotice}>
          <Ionicons name="notifications" size={20} color={COLORS.primary} />
          <Text style={styles.reminderText}>
            Local reminder scheduled for 15 minutes before session start time.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionContainer}>
          <AppButton
            title="View Digital QR Pass"
            onPress={() =>
              navigation.replace('BookingPass', { bookingId: booking.id })
            }
            variant="primary"
            icon={<Ionicons name="qr-code-outline" size={18} color={COLORS.white} />}
            style={styles.passBtn}
          />

          <AppButton
            title="Back to Home"
            onPress={() => navigation.navigate('MainTabs')}
            variant="outline"
          />
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
    padding: SPACING.xl,
    alignItems: 'center',
    paddingTop: SPACING.xxxl + 10,
  },
  celebrationCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.available,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  codeRow: {
    alignItems: 'center',
    paddingBottom: SPACING.xs,
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  codeValue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1.5,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  itemLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  itemValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'right',
    flex: 1,
    marginLeft: SPACING.md,
  },
  reminderNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    width: '100%',
    marginBottom: SPACING.xl,
  },
  reminderText: {
    marginLeft: SPACING.sm,
    fontSize: 12,
    color: COLORS.primaryDark,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },
  actionContainer: {
    width: '100%',
    gap: SPACING.md,
  },
  passBtn: {
    width: '100%',
  },
});
