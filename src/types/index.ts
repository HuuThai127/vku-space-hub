export type Role = 'student' | 'lecturer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  studentId: string;
  role: Role;
  avatar?: string;
  major?: string;
}

export type Building = 'A' | 'B' | 'C' | 'V';

export type RoomType = 'Study Room' | 'Discussion Room' | 'Computer Lab';

export type Equipment = 'Projector' | 'Whiteboard' | 'High-spec PC' | 'AC';

export type RoomStatus = 'Available Now' | 'Occupied' | 'Maintenance';

export interface Room {
  id: string;
  name: string;
  photo: string;
  building: Building;
  floor: number;
  capacity: number;
  type: RoomType;
  equipment: Equipment[];
  currentOccupancy: number;
  status: RoomStatus;
  description: string;
}

export interface TimeSlot {
  id: string;
  startTime: string; // e.g., "07:30"
  endTime: string;   // e.g., "09:30"
  label: string;     // e.g., "07:30 - 09:30"
}

export type SlotAvailabilityStatus = 'Available' | 'Booked' | 'Selected';

export type BookingStatus = 'confirmed' | 'checked_in' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  bookingCode: string; // e.g. "VKU-2026-A7F92C"
  roomId: string;
  roomName: string;
  building: Building;
  floor: number;
  roomType: RoomType;
  roomPhoto: string;
  userId: string;
  userName: string;
  userEmail: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  status: BookingStatus;
  createdAt: string;
  checkedInAt?: string;
  notificationId?: string;
  qrPayload: string;
}

export type NotificationType =
  | 'booking_created'
  | 'booking_reminder'
  | 'booking_cancelled'
  | 'check_in_success';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  bookingId?: string;
  bookingCode?: string;
}

export interface FilterState {
  searchQuery: string;
  building: Building | 'ALL';
  minimumCapacity: number | null; // 2, 5, 10, 15
  selectedEquipment: Equipment[];
  roomType: RoomType | 'ALL';
  selectedDate: string; // YYYY-MM-DD
  startTime: string | null;
  endTime: string | null;
}
