import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { getNext7Days } from '../../utils/dateUtils';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

interface DateSelectorProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  style?: ViewStyle;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onSelectDate,
  style,
}) => {
  const days = React.useMemo(() => getNext7Days(), []);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.sectionHeader}>Select Reservation Date</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {days.map((item) => {
          const isSelected = selectedDate === item.dateString;
          return (
            <TouchableOpacity
              key={item.dateString}
              activeOpacity={0.75}
              onPress={() => onSelectDate(item.dateString)}
              style={[
                styles.dayCard,
                isSelected ? styles.dayCardSelected : styles.dayCardUnselected,
              ]}
            >
              {item.isToday ? (
                <View style={[styles.todayIndicator, isSelected && styles.todayIndicatorSelected]}>
                  <Text style={[styles.todayText, isSelected && styles.todayTextSelected]}>
                    Today
                  </Text>
                </View>
              ) : null}
              <Text
                style={[
                  styles.dayName,
                  isSelected ? styles.dayNameSelected : styles.dayNameUnselected,
                ]}
              >
                {item.dayName}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  isSelected ? styles.dayNumberSelected : styles.dayNumberUnselected,
                ]}
              >
                {item.dayNumber}
              </Text>
              <Text
                style={[
                  styles.monthName,
                  isSelected ? styles.monthNameSelected : styles.monthNameUnselected,
                ]}
              >
                {item.monthName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  scrollContent: {
    paddingRight: SPACING.lg,
    gap: SPACING.sm,
  },
  dayCard: {
    width: 64,
    height: 84,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
    borderWidth: 1.5,
  },
  dayCardUnselected: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
  },
  dayCardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  todayIndicator: {
    position: 'absolute',
    top: 4,
    backgroundColor: COLORS.secondaryLight,
    paddingHorizontal: 4,
    borderRadius: RADIUS.sm,
  },
  todayIndicatorSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  todayText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  todayTextSelected: {
    color: COLORS.white,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  dayNameUnselected: {
    color: COLORS.textSecondary,
  },
  dayNameSelected: {
    color: COLORS.white,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  dayNumberUnselected: {
    color: COLORS.textPrimary,
  },
  dayNumberSelected: {
    color: COLORS.white,
  },
  monthName: {
    fontSize: 11,
    fontWeight: '500',
  },
  monthNameUnselected: {
    color: COLORS.textMuted,
  },
  monthNameSelected: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
});
