import { Booking, Room, User } from '../types';
import { storageService } from './storageService';
import { checkRoomSlotConflict } from '../utils/conflictEngine';
import { calculateDurationMinutes } from '../utils/dateUtils';
import { notificationService } from './notificationService';

export interface CreateBookingParams {
  room: Room;
  user: User;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

function generateBookingCode(): string {
  const chars = '0123456789ABCDEF';
  let randomHex = '';
  for (let i = 0; i < 6; i++) {
    randomHex += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const year = new Date().getFullYear();
  return `VKU-${year}-${randomHex}`;
}

export const bookingService = {
  async getBookings(): Promise<Booking[]> {
    return await storageService.getBookings();
  },

  async getBookingById(id: string): Promise<Booking | undefined> {
    const bookings = await storageService.getBookings();
    return bookings.find((b) => b.id === id);
  },

  /**
   * Creates a new booking with MANDATORY service-layer conflict verification.
   * Throws an Error if a conflict is detected.
   */
  async createBooking(params: CreateBookingParams): Promise<Booking> {
    const { room, user, date, startTime, endTime } = params;

    // Fetch latest bookings to ensure fresh state
    const currentBookings = await storageService.getBookings();

    // 1. Service-level conflict check
    const conflictResult = checkRoomSlotConflict(
      room.id,
      date,
      { startTime, endTime },
      currentBookings
    );

    if (conflictResult.hasConflict) {
      const conflicting = conflictResult.conflictingBooking;
      throw new Error(
        `Time conflict detected: Room ${room.name} is already reserved from ${conflicting?.startTime} to ${conflicting?.endTime} on ${date}.`
      );
    }

    // 2. Generate unique booking code and ID
    const bookingCode = generateBookingCode();
    const id = `bk-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const durationMinutes = calculateDurationMinutes(startTime, endTime);

    // 3. Schedule notification reminder 15 minutes before session
    const notificationId = await notificationService.scheduleBookingReminder(
      room.name,
      date,
      startTime
    );

    // 4. Construct booking object with safe QR payload
    const newBooking: Booking = {
      id,
      bookingCode,
      roomId: room.id,
      roomName: room.name,
      building: room.building,
      floor: room.floor,
      roomType: room.type,
      roomPhoto: room.photo,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      date,
      startTime,
      endTime,
      durationMinutes,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      notificationId,
      qrPayload: `VKU-SPACEHUB:${bookingCode}:${room.id}:${date}:${startTime}-${endTime}`,
    };

    // 5. Persist to storage
    const updatedBookings = [newBooking, ...currentBookings];
    await storageService.saveBookings(updatedBookings);

    return newBooking;
  },

  /**
   * Cancels a booking, updates slot availability, and cancels scheduled reminder.
   */
  async cancelBooking(bookingId: string): Promise<Booking> {
    const currentBookings = await storageService.getBookings();
    const index = currentBookings.findIndex((b) => b.id === bookingId);

    if (index === -1) {
      throw new Error('Booking not found.');
    }

    const booking = currentBookings[index];

    if (booking.status === 'cancelled') {
      throw new Error('This booking is already cancelled.');
    }
    if (booking.status === 'completed') {
      throw new Error('Completed reservations cannot be cancelled.');
    }

    // Cancel scheduled push reminder if it exists
    if (booking.notificationId) {
      await notificationService.cancelNotification(booking.notificationId);
    }

    const updatedBooking: Booking = {
      ...booking,
      status: 'cancelled',
    };

    currentBookings[index] = updatedBooking;
    await storageService.saveBookings(currentBookings);

    return updatedBooking;
  },

  /**
   * Validates and performs student check-in
   */
  async checkIn(bookingId: string): Promise<Booking> {
    const currentBookings = await storageService.getBookings();
    const index = currentBookings.findIndex((b) => b.id === bookingId);

    if (index === -1) {
      throw new Error('Booking not found.');
    }

    const booking = currentBookings[index];

    if (booking.status === 'cancelled') {
      throw new Error('Cannot check in to a cancelled reservation.');
    }
    if (booking.status === 'completed') {
      throw new Error('This reservation has already been completed.');
    }
    if (booking.status === 'checked_in') {
      return booking; // Already checked in
    }

    const updatedBooking: Booking = {
      ...booking,
      status: 'checked_in',
      checkedInAt: new Date().toISOString(),
    };

    currentBookings[index] = updatedBooking;
    await storageService.saveBookings(currentBookings);

    return updatedBooking;
  },
};
