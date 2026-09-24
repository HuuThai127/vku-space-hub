import { TimeSlot } from '../types';

export const DISCRETE_TIME_SLOTS: TimeSlot[] = [
  { id: 'slot-1', startTime: '07:30', endTime: '09:30', label: '07:30 - 09:30' },
  { id: 'slot-2', startTime: '09:30', endTime: '11:30', label: '09:30 - 11:30' },
  { id: 'slot-3', startTime: '13:00', endTime: '15:00', label: '13:00 - 15:00' },
  { id: 'slot-4', startTime: '15:00', endTime: '17:00', label: '15:00 - 17:00' },
];

export interface DayOption {
  dateString: string; // YYYY-MM-DD
  dayName: string;    // Mon, Tue, etc.
  dayNumber: number;  // 24
  monthName: string;  // Sep
  isToday: boolean;
  fullLabel: string;  // Monday, 24 Sep
}

/**
 * Generates the next 7 calendar days starting from today dynamically.
 */
export function getNext7Days(baseDate: Date = new Date()): DayOption[] {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const days: DayOption[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    days.push({
      dateString,
      dayName: dayNames[d.getDay()],
      dayNumber: d.getDate(),
      monthName: monthNames[d.getMonth()],
      isToday: i === 0,
      fullLabel: `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]}`,
    });
  }

  return days;
}

/**
 * Convert time string "HH:mm" to total minutes from 00:00
 */
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Calculate duration in minutes between two "HH:mm" times
 */
export function calculateDurationMinutes(startTime: string, endTime: string): number {
  return timeToMinutes(endTime) - timeToMinutes(startTime);
}

/**
 * Format date string "YYYY-MM-DD" into readable Vietnamese/English format
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${dayNames[d.getDay()]}, ${day} ${monthNames[d.getMonth()]} ${year}`;
}
