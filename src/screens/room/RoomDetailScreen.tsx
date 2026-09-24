import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackScreenProps } from '../../navigation/types';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DateSelector } from '../../components/rooms/DateSelector';
import { TimeSlotCard } from '../../components/rooms/TimeSlotCard';
import { AppButton } from '../../components/common/AppButton';
import { useRoomStore } from '../../store/useRoomStore';
import { useBookingStore } from '../../store/useBookingStore';
import { DISCRETE_TIME_SLOTS, getNext7Days } from '../../utils/dateUtils';
import { TimeSlot } from '../../types';
import { isSlotBooked } from '../../utils/conflictEngine';

export const RoomDetailScreen: React.FC<RootStackScreenProps<'RoomDetail'>> = ({
  route,
  navigation,
}) => {
  const { roomId } = route.params;

  const room = useRoomStore((s) => s.getRoomById(roomId));
  const allCampusBookings = useBookingStore((s) => s.allCampusBookings);

  const initialDate = useMemo(() => getNext7Days()[0].dateString, []);
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  if (!room) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Room not found</Text>
        <AppButton title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const isMaintenance = room.status === 'Maintenance';

  const occupancyRatio = Math.min(room.currentOccupancy / room.capacity, 1);
  const occupancyPercentage = Math.round(occupancyRatio * 100);

  const handleSelectSlot = (slot: TimeSlot) => {
    // Check if slot is booked
    const booked = isSlotBooked(room.id, selectedDate, slot, allCampusBookings);
    if (booked) {
      Alert.alert(
        'Time Slot Unavailable',
        `Slot ${slot.label} is already reserved by another student. Please select an available slot.`
      );
      return;
    }
    setSelectedSlot(slot);
  };

  const handleProceed = () => {
    if (!selectedSlot) {
      Alert.alert('Selection Required', 'Please select an available time slot to continue.');
      return;
    }

    if (isMaintenance) {
      Alert.alert('Room Under Maintenance', 'This room is currently closed for maintenance.');
      return;
    }

    navigation.navigate('BookingConfirmation', {
      roomId: room.id,
      date: selectedDate,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
    });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={room.name.split(' - ')[0]}
        subtitle={`Building ${room.building} • Floor ${room.floor}`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Photo */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: room.photo }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{room.type}</Text>
          </View>
          <View style={styles.statusBadgeWrapper}>
            <StatusBadge status={room.status} />
          </View>
        </View>

        {/* Room Header Info */}
        <View style={styles.section}>
          <Text style={styles.roomTitle}>{room.name}</Text>
          <Text style={styles.description}>{room.description}</Text>

          {/* Quick Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Ionicons name="business-outline" size={20} color={COLORS.primary} />
              <Text style={styles.statLabel}>Location</Text>
              <Text style={styles.statValue}>Bldg {room.building}, Fl {room.floor}</Text>
            </View>

            <View style={styles.statBox}>
              <Ionicons name="people-outline" size={20} color={COLORS.primary} />
              <Text style={styles.statLabel}>Max Capacity</Text>
              <Text style={styles.statValue}>{room.capacity} seats</Text>
            </View>

            <View style={styles.statBox}>
              <Ionicons name="pie-chart-outline" size={20} color={COLORS.primary} />
              <Text style={styles.statLabel}>Occupancy</Text>
              <Text style={styles.statValue}>{room.currentOccupancy}/{room.capacity} ({occupancyPercentage}%)</Text>
            </View>
          </View>

          {/* Equipment List */}
          <Text style={styles.subsectionTitle}>Available Facilities</Text>
          <View style={styles.equipmentRow}>
            {room.equipment.map((eq, index) => (
              <View key={`detail-eq-${index}`} style={styles.equipmentItem}>
                <Ionicons
                  name={
                    eq === 'AC'
                      ? 'snow-outline'
                      : eq === 'High-spec PC'
                      ? 'desktop-outline'
                      : eq === 'Projector'
                      ? 'videocam-outline'
                      : 'easel-outline'
                  }
                  size={15}
                  color={COLORS.primary}
                />
                <Text style={styles.equipmentText}>{eq}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 7-Day Date Selector */}
        <View style={styles.section}>
          <DateSelector
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setSelectedSlot(null); // Reset selection on date change
            }}
          />
        </View>

        {/* Discrete 2-Hour Time Slots */}
        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>Available Time Slots</Text>
          <Text style={styles.slotSubtitle}>
            Discrete 2-hour university reservation slots
          </Text>

          {DISCRETE_TIME_SLOTS.map((slot) => {
            const isBooked = isSlotBooked(
              room.id,
              selectedDate,
              slot,
              allCampusBookings
            );
            const isSelected = selectedSlot?.id === slot.id;

            return (
              <TimeSlotCard
                key={slot.id}
                slot={slot}
                isBooked={isBooked}
                isSelected={isSelected}
                onSelect={handleSelectSlot}
              />
            );
          })}
        </View>

        {/* Maintenance Warning if applicable */}
        {isMaintenance ? (
          <View style={styles.maintenanceCard}>
            <Ionicons name="warning-outline" size={24} color={COLORS.maintenance} />
            <Text style={styles.maintenanceText}>
              This room is currently scheduled for maintenance and cannot be reserved.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Floating Bottom Booking Action */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomInfo}>
          <Text style={styles.bottomLabel}>Selected Slot</Text>
          <Text style={styles.bottomSlotText}>
            {selectedSlot ? selectedSlot.label : 'Choose a time slot'}
          </Text>
        </View>
        <AppButton
          title="Proceed to Booking"
          onPress={handleProceed}
          disabled={!selectedSlot || isMaintenance}
          variant="primary"
          style={styles.proceedBtn}
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
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
    backgroundColor: COLORS.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  typeBadge: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    backgroundColor: 'rgba(11, 79, 156, 0.9)',
    paddingVertical: 5,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  typeBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusBadgeWrapper: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
  },
  section: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  roomTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
    textAlign: 'center',
  },
  subsectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  equipmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
  },
  equipmentText: {
    fontSize: 13,
    color: COLORS.primaryDark,
    fontWeight: '600',
    marginLeft: 6,
  },
  slotSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  maintenanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.maintenanceBg,
    margin: SPACING.lg,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.maintenanceBorder,
  },
  maintenanceText: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 13,
    color: COLORS.maintenance,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.lg,
  },
  bottomInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  bottomLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  bottomSlotText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  proceedBtn: {
    paddingHorizontal: SPACING.xl,
  },
});
