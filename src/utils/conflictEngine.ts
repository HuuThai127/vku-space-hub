import { Booking, TimeSlot } from '../types';
import { timeToMinutes } from './dateUtils';

export interface Interval {
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
}

/**
 * Pure conflict detection utility based on interval overlap:
 * newStart < existingEnd AND newEnd > existingStart
 */
export function hasBookingConflict(
  newSlot: Interval,
  existingSlot: Interval
): boolean {
  const newStart = timeToMinutes(newSlot.startTime);
  const newEnd = timeToMinutes(newSlot.endTime);
  const existingStart = timeToMinutes(existingSlot.startTime);
  const existingEnd = timeToMinutes(existingSlot.endTime);

  // Overlap condition
  return newStart < existingEnd && newEnd > existingStart;
}

/**
 * Checks if a requested reservation conflicts with any active booking in the list
 * for the same room on the same date.
 * Bookings with status 'cancelled' are ignored.
 */
export function checkRoomSlotConflict(
  roomId: string,
  date: string,
  newSlot: Interval,
  existingBookings: Booking[],
  excludeBookingId?: string
): { hasConflict: boolean; conflictingBooking?: Booking } {
  for (const booking of existingBookings) {
    // Skip if different room or date, or if booking was cancelled
    if (booking.roomId !== roomId) continue;
    if (booking.date !== date) continue;
    if (booking.status === 'cancelled') continue;
    if (excludeBookingId && booking.id === excludeBookingId) continue;

    const existingInterval: Interval = {
      startTime: booking.startTime,
      endTime: booking.endTime,
    };

    if (hasBookingConflict(newSlot, existingInterval)) {
      return {
        hasConflict: true,
        conflictingBooking: booking,
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Determines availability of a discrete slot for a specific room and date
 */
export function isSlotBooked(
  roomId: string,
  date: string,
  slot: TimeSlot,
  existingBookings: Booking[]
): boolean {
  const result = checkRoomSlotConflict(
    roomId,
    date,
    { startTime: slot.startTime, endTime: slot.endTime },
    existingBookings
  );
  return result.hasConflict;
}
