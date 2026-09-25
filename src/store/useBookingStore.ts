import { create } from 'zustand';
import { Booking, Room, User, TimeSlot } from '../types';
import { authService, RegisterParams } from '../services/authService';
import { bookingService } from '../services/bookingService';
import { isSlotBooked } from '../utils/conflictEngine';
import { useNotificationStore } from './useNotificationStore';

interface BookingStore {
  user: User | null;
  activeReservations: Booking[];
  bookingHistory: Booking[];
  allCampusBookings: Booking[];
  selectedBooking: Booking | null;
  loading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password?: string) => Promise<void>;
  register: (params: RegisterParams) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  refreshBookings: () => Promise<void>;
  selectBooking: (booking: Booking | null) => void;
  clearSelectedBooking: () => void;
  createBooking: (
    room: Room,
    date: string,
    startTime: string,
    endTime: string
  ) => Promise<Booking>;
  cancelBooking: (bookingId: string) => Promise<void>;
  checkIn: (bookingId: string) => Promise<void>;
  checkAvailability: (
    roomId: string,
    date: string,
    slot: TimeSlot
  ) => boolean;
  subscribeRealtime: () => () => void;
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  user: null,
  activeReservations: [],
  bookingHistory: [],
  allCampusBookings: [],
  selectedBooking: null,
  loading: false,
  error: null,

  restoreSession: async () => {
    set({ loading: true });
    try {
      const user = await authService.getCurrentUser();
      const allBookings = await bookingService.getBookings();

      const userBookings = user
        ? allBookings.filter((b) => b.userId === user.id)
        : [];

      const activeReservations = userBookings.filter(
        (b) => b.status === 'confirmed' || b.status === 'checked_in'
      );
      const bookingHistory = userBookings.filter(
        (b) => b.status === 'completed' || b.status === 'cancelled'
      );

      set({
        user,
        allCampusBookings: allBookings,
        activeReservations,
        bookingHistory,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  login: async (email: string, password?: string) => {
    set({ loading: true, error: null });
    try {
      const user = await authService.login(email, password);
      set({ user, loading: false });
      await get().refreshBookings();
    } catch (err: any) {
      set({ error: err.message || 'Login failed', loading: false });
      throw err;
    }
  },

  register: async (params: RegisterParams) => {
    set({ loading: true, error: null });
    try {
      const user = await authService.register(params);
      set({ user, loading: false });
      await get().refreshBookings();
    } catch (err: any) {
      set({ error: err.message || 'Registration failed', loading: false });
      throw err;
    }
  },

  loginDemo: async () => {
    set({ loading: true, error: null });
    try {
      const user = await authService.loginDemoUser();
      set({ user, loading: false });
      await get().refreshBookings();
    } catch (err: any) {
      set({ error: err.message || 'Demo login failed', loading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ loading: true });
    await authService.logout();
    set({
      user: null,
      activeReservations: [],
      bookingHistory: [],
      selectedBooking: null,
      loading: false,
      error: null,
    });
  },

  refreshBookings: async () => {
    const user = get().user;
    try {
      const allBookings = await bookingService.getBookings();
      const userBookings = user
        ? allBookings.filter((b) => b.userId === user.id)
        : [];

      const activeReservations = userBookings.filter(
        (b) => b.status === 'confirmed' || b.status === 'checked_in'
      );
      const bookingHistory = userBookings.filter(
        (b) => b.status === 'completed' || b.status === 'cancelled'
      );

      set({
        allCampusBookings: allBookings,
        activeReservations,
        bookingHistory,
      });
    } catch (err: any) {
      console.warn('Error refreshing bookings:', err);
    }
  },

  selectBooking: (booking: Booking | null) => {
    set({ selectedBooking: booking });
  },

  clearSelectedBooking: () => {
    set({ selectedBooking: null });
  },

  createBooking: async (
    room: Room,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<Booking> => {
    const user = get().user;
    if (!user) {
      throw new Error('You must be logged in to create a reservation.');
    }

    set({ loading: true, error: null });

    try {
      const newBooking = await bookingService.createBooking({
        room,
        user,
        date,
        startTime,
        endTime,
      });

      // Add to in-app notification center
      useNotificationStore
        .getState()
        .addNotification(
          'booking_created',
          'Reservation Confirmed',
          `Your reservation for ${room.name} on ${date} (${startTime} - ${endTime}) is confirmed.`,
          newBooking.id,
          newBooking.bookingCode
        );

      set({ selectedBooking: newBooking, loading: false });
      await get().refreshBookings();
      return newBooking;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  cancelBooking: async (bookingId: string) => {
    set({ loading: true, error: null });
    try {
      const cancelledBooking = await bookingService.cancelBooking(bookingId);

      // Notification
      useNotificationStore
        .getState()
        .addNotification(
          'booking_cancelled',
          'Reservation Cancelled',
          `Your booking for ${cancelledBooking.roomName} has been cancelled.`,
          cancelledBooking.id,
          cancelledBooking.bookingCode
        );

      // If currently selected booking was cancelled, update it
      if (get().selectedBooking?.id === bookingId) {
        set({ selectedBooking: cancelledBooking });
      }

      set({ loading: false });
      await get().refreshBookings();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  checkIn: async (bookingId: string) => {
    set({ loading: true, error: null });
    try {
      const checkedInBooking = await bookingService.checkIn(bookingId);

      // Notification
      useNotificationStore
        .getState()
        .addNotification(
          'check_in_success',
          'Check-in Verified',
          `Checked in at ${checkedInBooking.roomName}. Enjoy your session!`,
          checkedInBooking.id,
          checkedInBooking.bookingCode
        );

      if (get().selectedBooking?.id === bookingId) {
        set({ selectedBooking: checkedInBooking });
      }

      set({ loading: false });
      await get().refreshBookings();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  checkAvailability: (roomId: string, date: string, slot: TimeSlot): boolean => {
    const all = get().allCampusBookings;
    return !isSlotBooked(roomId, date, slot, all);
  },

  subscribeRealtime: () => {
    return bookingService.subscribeToBookings(() => {
      get().refreshBookings();
    });
  },
}));
