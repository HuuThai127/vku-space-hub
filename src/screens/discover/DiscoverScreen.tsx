import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ListRenderItem,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterChip } from '../../components/common/FilterChip';
import { RoomCard } from '../../components/rooms/RoomCard';
import { EmptyState } from '../../components/common/EmptyState';
import { useFilterStore } from '../../store/useFilterStore';
import { useRoomStore } from '../../store/useRoomStore';
import { Building, Equipment, Room, RoomType } from '../../types';

export const DiscoverScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Zustand selectors (minimizes unnecessary re-renders)
  const searchQuery = useFilterStore((s) => s.searchQuery);
  const setSearchQuery = useFilterStore((s) => s.setSearchQuery);
  const building = useFilterStore((s) => s.building);
  const setBuilding = useFilterStore((s) => s.setBuilding);
  const minimumCapacity = useFilterStore((s) => s.minimumCapacity);
  const setMinimumCapacity = useFilterStore((s) => s.setMinimumCapacity);
  const selectedEquipment = useFilterStore((s) => s.selectedEquipment);
  const toggleEquipment = useFilterStore((s) => s.toggleEquipment);
  const roomType = useFilterStore((s) => s.roomType);
  const setRoomType = useFilterStore((s) => s.setRoomType);
  const resetFilters = useFilterStore((s) => s.resetFilters);

  const rooms = useRoomStore((s) => s.rooms);

  // Multi-facet filtering logic with memoization
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      // 1. Search query (room name, building, room type)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = room.name.toLowerCase().includes(q);
        const matchesBuilding = room.building.toLowerCase().includes(q);
        const matchesType = room.type.toLowerCase().includes(q);
        if (!matchesName && !matchesBuilding && !matchesType) {
          return false;
        }
      }

      // 2. Building filter
      if (building !== 'ALL' && room.building !== building) {
        return false;
      }

      // 3. Minimum Capacity
      if (minimumCapacity !== null && room.capacity < minimumCapacity) {
        return false;
      }

      // 4. Room Type
      if (roomType !== 'ALL' && room.type !== roomType) {
        return false;
      }

      // 5. Selected Equipment (all selected equipment must be present)
      if (selectedEquipment.length > 0) {
        const hasAllEquipment = selectedEquipment.every((eq) =>
          room.equipment.includes(eq)
        );
        if (!hasAllEquipment) return false;
      }

      return true;
    });
  }, [rooms, searchQuery, building, minimumCapacity, roomType, selectedEquipment]);

  const handleRoomPress = useCallback(
    (room: Room) => {
      navigation.navigate('RoomDetail', { roomId: room.id });
    },
    [navigation]
  );

  const renderRoomItem: ListRenderItem<Room> = useCallback(
    ({ item }) => <RoomCard room={item} onPress={handleRoomPress} />,
    [handleRoomPress]
  );

  const keyExtractor = useCallback((item: Room) => item.id, []);

  const activeFilterCount =
    (building !== 'ALL' ? 1 : 0) +
    (minimumCapacity !== null ? 1 : 0) +
    (roomType !== 'ALL' ? 1 : 0) +
    selectedEquipment.length;

  return (
    <View style={styles.container}>
      {/* Search & Header */}
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Discover Spaces</Text>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search e.g. V203, Computer Lab, Building A..."
          style={styles.searchBar}
        />

        {/* Primary Filter Tabs: Buildings */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.buildingTabs}
        >
          {(['ALL', 'A', 'B', 'C', 'V'] as (Building | 'ALL')[]).map((b) => (
            <FilterChip
              key={b}
              label={b === 'ALL' ? 'All Buildings' : `Building ${b}`}
              selected={building === b}
              onPress={() => setBuilding(b)}
            />
          ))}

          {/* Toggle More Filters */}
          <TouchableOpacity
            style={[
              styles.filterToggleBtn,
              activeFilterCount > 0 && styles.filterToggleActive,
            ]}
            onPress={() => setShowAdvancedFilters((prev) => !prev)}
          >
            <Ionicons
              name="options-outline"
              size={16}
              color={activeFilterCount > 0 ? COLORS.white : COLORS.primary}
            />
            <Text
              style={[
                styles.filterToggleText,
                activeFilterCount > 0 && styles.filterToggleTextActive,
              ]}
            >
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Expandable Advanced Filters */}
        {showAdvancedFilters ? (
          <View style={styles.advancedFiltersCard}>
            {/* Room Type */}
            <Text style={styles.filterSectionTitle}>Room Type</Text>
            <View style={styles.chipRow}>
              {(['ALL', 'Study Room', 'Discussion Room', 'Computer Lab'] as (
                | RoomType
                | 'ALL'
              )[]).map((type) => (
                <FilterChip
                  key={type}
                  label={type}
                  selected={roomType === type}
                  onPress={() => setRoomType(type)}
                />
              ))}
            </View>

            {/* Capacity */}
            <Text style={styles.filterSectionTitle}>Capacity (Seats)</Text>
            <View style={styles.chipRow}>
              {[null, 2, 5, 10, 15].map((cap) => (
                <FilterChip
                  key={cap === null ? 'any' : `cap-${cap}`}
                  label={cap === null ? 'Any Size' : `${cap}+ Seats`}
                  selected={minimumCapacity === cap}
                  onPress={() => setMinimumCapacity(cap)}
                />
              ))}
            </View>

            {/* Equipment */}
            <Text style={styles.filterSectionTitle}>Required Equipment</Text>
            <View style={styles.chipRow}>
              {(['Projector', 'Whiteboard', 'High-spec PC', 'AC'] as Equipment[]).map(
                (eq) => (
                  <FilterChip
                    key={eq}
                    label={eq}
                    selected={selectedEquipment.includes(eq)}
                    onPress={() => toggleEquipment(eq)}
                  />
                )
              )}
            </View>

            {activeFilterCount > 0 ? (
              <TouchableOpacity
                onPress={resetFilters}
                style={styles.resetButton}
              >
                <Text style={styles.resetButtonText}>Reset All Filters</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* Main High-Performance Room Feed */}
      <FlatList
        data={filteredRooms}
        renderItem={renderRoomItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        ListEmptyComponent={
          <EmptyState
            title="No Spaces Match Your Filter"
            message="Try clearing your search query or adjusting your building, equipment, and capacity filters."
            icon="search-outline"
            actionTitle="Reset Filters"
            onAction={resetFilters}
          />
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
  topBar: {
    backgroundColor: COLORS.white,
    paddingTop: SPACING.xl + 10,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  searchBar: {
    marginBottom: SPACING.md,
  },
  buildingTabs: {
    paddingBottom: SPACING.xs,
  },
  filterToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    marginBottom: SPACING.xs,
  },
  filterToggleActive: {
    backgroundColor: COLORS.primary,
  },
  filterToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 4,
  },
  filterToggleTextActive: {
    color: COLORS.white,
  },
  advancedFiltersCard: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  filterSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: SPACING.xs,
    marginBottom: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  resetButton: {
    alignSelf: 'flex-end',
    paddingVertical: SPACING.xs,
  },
  resetButtonText: {
    fontSize: 12,
    color: COLORS.maintenance,
    fontWeight: '600',
  },
  listContent: {
    padding: SPACING.lg,
  },
});
