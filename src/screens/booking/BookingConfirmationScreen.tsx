import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackScreenProps } from '../../navigation/types';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { AppButton } from '../../components/common/AppButton';
import { useRoomStore } from '../../store/useRoomStore';
import { useBookingStore } from '../../store/useBookingStore';
import { formatDisplayDate, calculateDurationMinutes } from '../../utils/dateUtils';
import { checkRoomSlotConflict } from '../../utils/conflictEngine';

export const BookingConfirmationScreen: React.FC<
  RootStackScreenProps<'BookingConfirmation'>
> = ({ route, navigation }) => {
  const { roomId, date, startTime, endTime } = route.params;

  const room = useRoomStore((s) => s.getRoomById(roomId));
  const user = useBookingStore((s) => s.user);
  const allCampusBookings = useBookingStore((s) => s.allCampusBookings);
  const createBooking = useBookingStore((s) => s.createBooking);

  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevents duplicate submission

  if (!room || !user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Missing booking or student information.</Text>
        <AppButton title="Return" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const duration = calculateDurationMinutes(startTime, endTime);

  const handleConfirmReservation = async () => {
    // 1. Prevent duplicate submission
    if (isSubmitting || loading) return;

    // 2. Validate inputs
    if (!date || !startTime || !endTime) {
      Alert.alert('Validation Error', 'Invalid reservation timeframe.');
      return;
    }

    // 3. UI-layer conflict check before submission
    const conflictResult = checkRoomSlotConflict(
      room.id,
      date,
      { startTime, endTime },
      allCampusBookings
    );

    if (conflictResult.hasConflict) {
      const conflicting = conflictResult.conflictingBooking;
      Alert.alert(
        'Time Conflict Detected ⚠️',
        `Room ${room.name} has already been reserved from ${conflicting?.startTime} to ${conflicting?.endTime} on ${date}. Please select another slot or room.`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setLoading(true);

      // 4. Create booking via Zustand store (which invokes bookingService with service-layer conflict check)
      const newBooking = await createBooking(room, date, startTime, endTime);

      setLoading(false);
      // Navigate to BookingSuccess
      navigation.replace('BookingSuccess', { bookingId: newBooking.id });
    } catch (err: any) {
      setLoading(false);
      setIsSubmitting(false);
      Alert.alert(
        'Booking Rejected',
        err.message || 'Unable to confirm reservation due to a conflict.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Review & Confirm"
        subtitle="Step 2 of 2: Reservation Summary"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Room Header Card */}
        <View style={styles.card}>
          <View style={styles.roomHeader}>
            <Image source={{ uri: room.photo }} style={styles.roomPhoto} />
            <View style={styles.roomHeaderInfo}>
              <Text style={styles.roomName}>{room.name}</Text>
              <Text style={styles.roomType}>{room.type}</Text>
              <Text style={styles.roomLocation}>
                Building {room.building} • Floor {room.floor}
              </Text>
            </View>
          </View>
        </View>

        {/* Reservation Schedule Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reservation Details</Text>

          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons name="calendar" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Date</Text>
              <Text style={styles.rowValue}>{formatDisplayDate(date)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons name="time" size={18} color={COLORS.secondary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Time Slot</Text>
              <Text style={styles.rowValue}>
                {startTime} - {endTime}
              </Text>
            </View>
            <View style={styles.durationBadge}>
              <Text style={styles.durationBadgeText}>{duration} mins</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons name="people" size={18} color={COLORS.available} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Room Capacity</Text>
              <Text style={styles.rowValue}>{room.capacity} students max</Text>
            </View>
          </View>
        </View>

        {/* Student Session Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Student Credentials</Text>
          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons name="person" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Student Name</Text>
              <Text style={styles.rowValue}>{user.name}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons name="school" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>VKU Student ID / Email</Text>
              <Text style={styles.rowValue}>
                {user.studentId} • {user.email}
              </Text>
            </View>
          </View>
        </View>

        {/* Policies Note */}
        <View style={styles.policyBox}>
          <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
          <Text style={styles.policyText}>
            A reminder notification will be scheduled 15 minutes before your session begins. Please check in with your QR pass upon arrival.
          </Text>
        </View>
      </ScrollView>

      {/* Confirmation Button */}
      <View style={styles.footer}>
        <AppButton
          title={loading ? 'Verifying & Confirming...' : 'Confirm Reservation'}
          onPress={handleConfirmReservation}
          loading={loading}
          disabled={loading || isSubmitting}
          variant="primary"
          icon={<Ionicons name="checkmark-done" size={20} color={COLORS.white} />}
        />
      </View>
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
    paddingBottom: 100,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomPhoto: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.border,
  },
  roomHeaderInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  roomName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  roomType: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  roomLocation: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  rowLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  durationBadge: {
    backgroundColor: COLORS.secondaryLight,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  durationBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md,
  },
  policyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xs,
  },
  policyText: {
    marginLeft: SPACING.sm,
    fontSize: 12,
    color: COLORS.primaryDark,
    lineHeight: 18,
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.lg,
  },
});
