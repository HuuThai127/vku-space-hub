import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { RootStackParamList, MainTabParamList } from '../../navigation/types';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterChip } from '../../components/common/FilterChip';
import { RoomCard } from '../../components/rooms/RoomCard';
import { BookingCard } from '../../components/booking/BookingCard';
import { useBookingStore } from '../../store/useBookingStore';
import { useRoomStore } from '../../store/useRoomStore';
import { useFilterStore } from '../../store/useFilterStore';
import { Building, Room } from '../../types';

type HomeScreenNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavProp>();

  const user = useBookingStore((s) => s.user);
  const activeReservations = useBookingStore((s) => s.activeReservations);
  const cancelBooking = useBookingStore((s) => s.cancelBooking);
  const checkIn = useBookingStore((s) => s.checkIn);

  const rooms = useRoomStore((s) => s.rooms);
  const subscribeRealtime = useRoomStore((s) => s.subscribeRealtime);

  const searchQuery = useFilterStore((s) => s.searchQuery);
  const setSearchQuery = useFilterStore((s) => s.setSearchQuery);
  const building = useFilterStore((s) => s.building);
  const setBuilding = useFilterStore((s) => s.setBuilding);

  // Subscribe to real-time room availability changes on mount
  useEffect(() => {
    const unsubscribe = subscribeRealtime();
    return () => unsubscribe();
  }, [subscribeRealtime]);

  const upcomingBooking = activeReservations[0];

  // Quick filter for available rooms
  const availableRooms = React.useMemo(() => {
    return rooms
      .filter((r) => r.status === 'Available Now')
      .slice(0, 4);
  }, [rooms]);

  const handleRoomPress = useCallback(
    (room: Room) => {
      navigation.navigate('RoomDetail', { roomId: room.id });
    },
    [navigation]
  );

  const handleSearchFocus = () => {
    navigation.navigate('Discover');
  };

  const handleViewPass = useCallback(
    (booking: any) => {
      navigation.navigate('BookingPass', { bookingId: booking.id });
    },
    [navigation]
  );

  const handleCheckIn = useCallback(
    (booking: any) => {
      navigation.navigate('QRCheckIn', { bookingId: booking.id });
    },
    [navigation]
  );

  const handleCancel = useCallback(
    (booking: any) => {
      cancelBooking(booking.id);
    },
    [cancelBooking]
  );

  return (
    <View style={styles.container}>
      {/* Top App Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingSub}>Welcome back,</Text>
          <Text style={styles.greetingName}>{user?.name || 'VKU Student'} 👋</Text>
        </View>

        <TouchableOpacity
          style={styles.profileBadge}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <TouchableOpacity activeOpacity={0.9} onPress={handleSearchFocus}>
          <SearchBar
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              navigation.navigate('Discover');
            }}
            placeholder="Search room code (e.g. V203), building..."
            style={styles.searchBar}
          />
        </TouchableOpacity>

        {/* Quick Building Filters */}
        <View style={styles.quickFiltersSection}>
          <Text style={styles.sectionTitle}>Select Building</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickFiltersList}
          >
            {(['ALL', 'A', 'B', 'C', 'V'] as (Building | 'ALL')[]).map((b) => (
              <FilterChip
                key={b}
                label={b === 'ALL' ? 'All Buildings' : `Building ${b}`}
                selected={building === b}
                onPress={() => {
                  setBuilding(b);
                  if (b !== 'ALL') {
                    navigation.navigate('Discover');
                  }
                }}
              />
            ))}
          </ScrollView>
        </View>

        {/* Upcoming Active Reservation Card */}
        {upcomingBooking ? (
          <View style={styles.upcomingSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Upcoming Session</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Reservations', { initialTab: 'upcoming' })}
              >
                <Text style={styles.seeAllText}>View All ({activeReservations.length})</Text>
              </TouchableOpacity>
            </View>

            <BookingCard
              booking={upcomingBooking}
              onViewPass={handleViewPass}
              onCheckIn={handleCheckIn}
              onCancel={handleCancel}
            />
          </View>
        ) : null}

        {/* Available Rooms Highlights */}
        <View style={styles.availableSection}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Available Right Now</Text>
              <Text style={styles.sectionSubtitle}>
                Instant study pods & free discussion tables
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Discover')}>
              <Text style={styles.seeAllText}>Explore All</Text>
            </TouchableOpacity>
          </View>

          {availableRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onPress={handleRoomPress}
            />
          ))}
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
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl + 10,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  greetingSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  greetingName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  profileBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  searchBar: {
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  quickFiltersSection: {
    marginBottom: SPACING.xl,
  },
  quickFiltersList: {
    paddingTop: SPACING.xs,
  },
  upcomingSection: {
    marginBottom: SPACING.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  availableSection: {
    marginBottom: SPACING.xl,
  },
});
