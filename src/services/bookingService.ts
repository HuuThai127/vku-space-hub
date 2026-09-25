import { Booking, Room, User } from '../types';
import { storageService } from './storageService';
import { checkRoomSlotConflict } from '../utils/conflictEngine';
import { calculateDurationMinutes } from '../utils/dateUtils';
import { notificationService } from './notificationService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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

/**
 * Maps PostgreSQL snake_case database row from 'bookings' table
 * to client TypeScript Booking domain model.
 */
export function mapSupabaseBookingToBooking(row: any): Booking {
  const startTime = (row.start_time || '07:30').slice(0, 5);
  const endTime = (row.end_time || '09:30').slice(0, 5);
  const durationMinutes = calculateDurationMinutes(startTime, endTime);
  const roomName = row.room?.name || 'VKU Study Space';
  const building = row.room?.building || 'A';
  const floor = row.room?.floor ?? 1;
  const roomType = row.room?.room_type || 'Study Room';
  const roomPhoto = row.room?.photo_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80';
  const userName = row.profile?.full_name || 'VKU Student';
  const userEmail = row.profile?.email || 'student@vku.edu.vn';

  return {
    id: row.id,
    bookingCode: row.booking_code,
    roomId: row.room_id,
    roomName,
    building,
    floor,
    roomType,
    roomPhoto,
    userId: row.user_id,
    userName,
    userEmail,
    date: row.booking_date,
    startTime,
    endTime,
    durationMinutes,
    status: row.status,
    createdAt: row.created_at,
    checkedInAt: row.checked_in_at,
    notificationId: row.notification_id,
    qrPayload: `VKU-SPACEHUB:${row.booking_code}:${row.room_id}:${row.booking_date}:${startTime}-${endTime}`,
  };
}

export const bookingService = {
  /**
   * Fetches all campus bookings from Supabase with caching in AsyncStorage.
   */
  async getBookings(): Promise<Booking[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            id,
            booking_code,
            room_id,
            user_id,
            booking_date,
            start_time,
            end_time,
            status,
            checked_in_at,
            notification_id,
            created_at,
            room:rooms (
              id,
              code,
              name,
              building,
              floor,
              room_type,
              photo_url
            ),
            profile:profiles (
              id,
              full_name,
              email
            )
          `)
          .order('booking_date', { ascending: false })
          .order('start_time', { ascending: false });

        if (error) {
          console.warn('Error fetching bookings from Supabase:', error.message);
          return await storageService.getBookings();
        }

        if (data && data.length > 0) {
          const mappedBookings: Booking[] = data.map(mapSupabaseBookingToBooking);
          // Keep offline cache up to date
          await storageService.saveBookings(mappedBookings);
          return mappedBookings;
        }
      } catch (err) {
        console.warn('Network error querying bookings:', err);
      }
    }

    return await storageService.getBookings();
  },

  /**
   * Retrieves a single booking by its UUID or booking code.
   */
  async getBookingById(id: string): Promise<Booking | undefined> {
    const bookings = await this.getBookings();
    return bookings.find((b) => b.id === id || b.bookingCode === id);
  },

  /**
   * Creates a new booking with dual-layer conflict verification:
   * 1. Immediate client-side conflict check for responsive UI feedback.
   * 2. Authoritative PostgreSQL RPC (create_booking) with row-level locks and interval overlap verification.
   */
  async createBooking(params: CreateBookingParams): Promise<Booking> {
    const { room, user, date, startTime, endTime } = params;

    // 1. Immediate client-side conflict check
    const currentBookings = await this.getBookings();
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

    const bookingCode = generateBookingCode();

    // 2. Authoritative Supabase RPC Execution
    if (isSupabaseConfigured()) {
      const formattedStart = startTime.length === 5 ? `${startTime}:00` : startTime;
      const formattedEnd = endTime.length === 5 ? `${endTime}:00` : endTime;

      const { data, error } = await supabase.rpc('create_booking', {
        p_user_id: user.id,
        p_room_id: room.id,
        p_booking_date: date,
        p_start_time: formattedStart,
        p_end_time: formattedEnd,
        p_booking_code: bookingCode,
      });

      if (error) {
        if (error.message.includes('BOOKING_CONFLICT')) {
          throw new Error(
            `Time conflict detected: Room ${room.name} is already reserved for this timeframe on ${date}.`
          );
        }
        throw new Error(error.message);
      }

      // Schedule device push reminder (Expo Notifications)
      const notificationId = await notificationService.scheduleBookingReminder(
        room.name,
        date,
        startTime
      );

      // Record notificationId if generated
      if (notificationId && data?.id) {
        try {
          await supabase
            .from('bookings')
            .update({ notification_id: notificationId })
            .eq('id', data.id);
        } catch (e) {
          console.warn('Note: could not update notification_id on booking:', e);
        }
      }

      // Record notification metadata in Supabase
      await notificationService.createNotificationRecord({
        userId: user.id,
        type: 'booking_created',
        title: 'Reservation Confirmed',
        message: `Your reservation for ${room.name} on ${date} (${startTime} - ${endTime}) is confirmed.`,
        bookingId: data.id,
        bookingCode,
      });

      const newBooking: Booking = {
        id: data.id,
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
        durationMinutes: calculateDurationMinutes(startTime, endTime),
        status: 'confirmed',
        createdAt: data.created_at || new Date().toISOString(),
        notificationId,
        qrPayload: `VKU-SPACEHUB:${bookingCode}:${room.id}:${date}:${startTime}-${endTime}`,
      };

      // Refresh cache
      const updatedCache = [newBooking, ...currentBookings];
      await storageService.saveBookings(updatedCache);

      return newBooking;
    }

    // 3. Mock Fallback when Supabase is not configured
    const id = `bk-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const durationMinutes = calculateDurationMinutes(startTime, endTime);

    const notificationId = await notificationService.scheduleBookingReminder(
      room.name,
      date,
      startTime
    );

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

    const updatedBookings = [newBooking, ...currentBookings];
    await storageService.saveBookings(updatedBookings);

    return newBooking;
  },

  /**
   * Cancels a booking, releases slot, updates Supabase, and cancels scheduled reminder.
   */
  async cancelBooking(bookingId: string): Promise<Booking> {
    const currentBookings = await this.getBookings();
    const existing = currentBookings.find((b) => b.id === bookingId);

    if (!existing) {
      throw new Error('Booking not found.');
    }

    if (existing.status === 'cancelled') {
      throw new Error('This booking is already cancelled.');
    }
    if (existing.status === 'completed') {
      throw new Error('Completed reservations cannot be cancelled.');
    }

    // Cancel scheduled push reminder if it exists
    if (existing.notificationId) {
      await notificationService.cancelNotification(existing.notificationId);
    }

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .select(`
          *,
          room:rooms(*),
          profile:profiles(*)
        `)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      await notificationService.createNotificationRecord({
        userId: data.user_id,
        type: 'booking_cancelled',
        title: 'Reservation Cancelled',
        message: `Your booking for ${data.room?.name || existing.roomName} has been cancelled.`,
        bookingId: data.id,
        bookingCode: data.booking_code,
      });

      const updated = mapSupabaseBookingToBooking(data);
      const updatedCache = currentBookings.map((b) => (b.id === bookingId ? updated : b));
      await storageService.saveBookings(updatedCache);
      return updated;
    }

    // Mock fallback
    const updatedBooking: Booking = {
      ...existing,
      status: 'cancelled',
    };

    const updatedCache = currentBookings.map((b) => (b.id === bookingId ? updatedBooking : b));
    await storageService.saveBookings(updatedCache);
    return updatedBooking;
  },

  /**
   * Validates and performs student check-in
   */
  async checkIn(bookingId: string): Promise<Booking> {
    const currentBookings = await this.getBookings();
    const existing = currentBookings.find((b) => b.id === bookingId);

    if (!existing) {
      throw new Error('Booking not found.');
    }

    if (existing.status === 'cancelled') {
      throw new Error('Cannot check in to a cancelled reservation.');
    }
    if (existing.status === 'completed') {
      throw new Error('This reservation has already been completed.');
    }
    if (existing.status === 'checked_in') {
      return existing; // Already checked in
    }

    const checkInTimestamp = new Date().toISOString();

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'checked_in',
          checked_in_at: checkInTimestamp,
        })
        .eq('id', bookingId)
        .select(`
          *,
          room:rooms(*),
          profile:profiles(*)
        `)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      await notificationService.createNotificationRecord({
        userId: data.user_id,
        type: 'check_in_success',
        title: 'Check-in Verified',
        message: `Checked in at ${data.room?.name || existing.roomName}. Enjoy your session!`,
        bookingId: data.id,
        bookingCode: data.booking_code,
      });

      const updated = mapSupabaseBookingToBooking(data);
      const updatedCache = currentBookings.map((b) => (b.id === bookingId ? updated : b));
      await storageService.saveBookings(updatedCache);
      return updated;
    }

    // Mock fallback
    const updatedBooking: Booking = {
      ...existing,
      status: 'checked_in',
      checkedInAt: checkInTimestamp,
    };

    const updatedCache = currentBookings.map((b) => (b.id === bookingId ? updatedBooking : b));
    await storageService.saveBookings(updatedCache);
    return updatedBooking;
  },

  /**
   * Subscribes to real-time booking changes from Supabase.
   */
  subscribeToBookings(onUpdate: () => void): () => void {
    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel('public:bookings')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bookings' },
          () => {
            onUpdate();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
    return () => {};
  },
};
