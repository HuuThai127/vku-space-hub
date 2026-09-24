import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Room } from '../../types';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { StatusBadge } from '../common/StatusBadge';

interface RoomCardProps {
  room: Room;
  onPress: (room: Room) => void;
  style?: ViewStyle;
}

export const RoomCard: React.FC<RoomCardProps> = React.memo(
  ({ room, onPress, style }) => {
    const occupancyRatio = Math.min(room.currentOccupancy / room.capacity, 1);
    const occupancyPercentage = Math.round(occupancyRatio * 100);

    const getOccupancyBarColor = () => {
      if (room.status === 'Maintenance') return COLORS.maintenance;
      if (occupancyRatio >= 0.9) return COLORS.occupied;
      if (occupancyRatio >= 0.5) return COLORS.secondary;
      return COLORS.available;
    };

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => onPress(room)}
        style={[styles.card, style]}
      >
        {/* Room Image with Type Badge */}
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

        {/* Room Info */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.roomName} numberOfLines={1}>
              {room.name}
            </Text>
          </View>

          {/* Location and Capacity */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="business-outline" size={15} color={COLORS.primary} />
              <Text style={styles.metaText}>
                Building {room.building} • Floor {room.floor}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={15} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>
                Max {room.capacity} seats
              </Text>
            </View>
          </View>

          {/* Occupancy Indicator */}
          <View style={styles.occupancySection}>
            <View style={styles.occupancyLabelRow}>
              <Text style={styles.occupancyLabel}>Current Occupancy</Text>
              <Text style={styles.occupancyValue}>
                {room.currentOccupancy} / {room.capacity} ({occupancyPercentage}%)
              </Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${occupancyPercentage}%`,
                    backgroundColor: getOccupancyBarColor(),
                  },
                ]}
              />
            </View>
          </View>

          {/* Equipment Pills */}
          <View style={styles.equipmentRow}>
            {room.equipment.map((eq, index) => (
              <View key={`${room.id}-eq-${index}`} style={styles.equipmentPill}>
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
                  size={12}
                  color={COLORS.textSecondary}
                  style={styles.equipmentIcon}
                />
                <Text style={styles.equipmentText}>{eq}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  }
);

RoomCard.displayName = 'RoomCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.md,
  },
  imageContainer: {
    width: '100%',
    height: 160,
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
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  typeBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadgeWrapper: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
  },
  content: {
    padding: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  roomName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 5,
    fontWeight: '500',
  },
  occupancySection: {
    marginBottom: SPACING.md,
  },
  occupancyLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  occupancyLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  occupancyValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: COLORS.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  equipmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  equipmentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 3,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  equipmentIcon: {
    marginRight: 4,
  },
  equipmentText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
