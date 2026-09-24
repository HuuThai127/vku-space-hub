import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MainTabParamList } from '../../navigation/types';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { BookingCard } from '../../components/booking/BookingCard';
import { EmptyState } from '../../components/common/EmptyState';
import { useBookingStore } from '../../store/useBookingStore';
import { Booking } from '../../types';

export const ReservationsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<MainTabParamList, 'Reservations'>>();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>(
    route.params?.initialTab || 'upcoming'
  );

  const activeReservations = useBookingStore((s) => s.activeReservations);
  const bookingHistory = useBookingStore((s) => s.bookingHistory);
  const cancelBooking = useBookingStore((s) => s.cancelBooking);

  const currentList = activeTab === 'upcoming' ? activeReservations : bookingHistory;

  const handleViewPass = (booking: Booking) => {
    navigation.navigate('BookingPass', { bookingId: booking.id });
  };

  const handleCheckIn = (booking: Booking) => {
    navigation.navigate('QRCheckIn', { bookingId: booking.id });
  };

  const handleCancel = async (booking: Booking) => {
    try {
      await cancelBooking(booking.id);
      Alert.alert(
        'Reservation Cancelled',
        `Your reservation for ${booking.roomName} has been cancelled. The time slot is now available for other students.`
      );
    } catch (err: any) {
      Alert.alert('Cancellation Error', err.message || 'Unable to cancel booking.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Reservations</Text>
        <Text style={styles.subtitle}>
          Manage upcoming study room bookings & review past attendance
        </Text>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('upcoming')}
            style={[
              styles.tabBtn,
              activeTab === 'upcoming' && styles.tabBtnActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'upcoming' && styles.tabTextActive,
              ]}
            >
              Upcoming ({activeReservations.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('history')}
            style={[
              styles.tabBtn,
              activeTab === 'history' && styles.tabBtnActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'history' && styles.tabTextActive,
              ]}
            >
              History ({bookingHistory.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Booking List */}
      <FlatList
        data={currentList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onViewPass={handleViewPass}
            onCheckIn={activeTab === 'upcoming' ? handleCheckIn : undefined}
            onCancel={activeTab === 'upcoming' ? handleCancel : undefined}
          />
        )}
        ListEmptyComponent={
          activeTab === 'upcoming' ? (
            <EmptyState
              title="No Upcoming Reservations"
              message="You do not have any active room or lab reservations right now. Explore available campus spaces and book a slot!"
              icon="calendar-outline"
              actionTitle="Discover Rooms"
              onAction={() => navigation.navigate('Discover' as any)}
            />
          ) : (
            <EmptyState
              title="No Booking History"
              message="Past completed or cancelled reservations will appear here."
              icon="time-outline"
            />
          )
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
    ...SHADOWS.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  tabBtnActive: {
    backgroundColor: COLORS.white,
    ...SHADOWS.sm,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  listContent: {
    padding: SPACING.lg,
  },
});
