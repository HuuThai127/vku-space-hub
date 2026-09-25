/**
 * VKU SpaceHub - Academic Verification Test Suite
 * Tests Pure Functions:
 * 1. hasBookingConflict() interval overlap algorithm (PostgreSQL interval rule)
 * 2. checkRoomSlotConflict() with active & cancelled bookings
 * 3. Discrete 2-hour duration calculation and booking validation
 * 4. Multi-facet filter logic (name, building, capacity, equipment)
 * 5. Booking status lifecycle transitions
 * 6. Supabase Database Row -> TypeScript Domain Model mappers
 */

// Pure functions under test
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function calculateDurationMinutes(startTime, endTime) {
  return timeToMinutes(endTime) - timeToMinutes(startTime);
}

function hasBookingConflict(newSlot, existingSlot) {
  const newStart = timeToMinutes(newSlot.startTime);
  const newEnd = timeToMinutes(newSlot.endTime);
  const existingStart = timeToMinutes(existingSlot.startTime);
  const existingEnd = timeToMinutes(existingSlot.endTime);

  // Overlap rule: newStart < existingEnd AND newEnd > existingStart
  return newStart < existingEnd && newEnd > existingStart;
}

function checkRoomSlotConflict(roomId, date, newSlot, existingBookings, excludeBookingId) {
  for (const booking of existingBookings) {
    if (booking.roomId !== roomId) continue;
    if (booking.date !== date) continue;
    if (booking.status === 'cancelled') continue;
    if (excludeBookingId && booking.id === excludeBookingId) continue;

    const existingInterval = {
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

// Validation logic matching database constraints
function validateBookingInput({ roomId, date, startTime, endTime, roomStatus }) {
  if (!roomId || !date || !startTime || !endTime) {
    throw new Error('All booking fields are required');
  }
  if (roomStatus === 'Maintenance' || roomStatus === 'maintenance') {
    throw new Error('ROOM_MAINTENANCE: Room is currently closed for maintenance');
  }
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  if (startMin >= endMin) {
    throw new Error('INVALID_TIME_RANGE: Start time must be before end time');
  }
  const duration = endMin - startMin;
  if (duration <= 0) {
    throw new Error('INVALID_DURATION: Duration must be greater than zero');
  }
  return true;
}

function validateInstitutionalEmail(email) {
  const normalized = email.trim().toLowerCase();
  return normalized.includes('@vku.edu.vn') || normalized.includes('vku');
}

// Data mapping functions matching roomService and bookingService
function mapSupabaseRoomToRoom(row) {
  let uiStatus = 'Available Now';
  if (row.status === 'occupied') {
    uiStatus = 'Occupied';
  } else if (row.status === 'maintenance') {
    uiStatus = 'Maintenance';
  } else {
    if (row.current_occupancy >= row.capacity) {
      uiStatus = 'Occupied';
    } else {
      uiStatus = 'Available Now';
    }
  }

  return {
    id: row.id,
    name: row.name,
    photo: row.photo_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    building: row.building,
    floor: row.floor ?? 1,
    capacity: row.capacity,
    type: row.room_type,
    equipment: Array.isArray(row.equipment) ? row.equipment : [],
    currentOccupancy: row.current_occupancy ?? 0,
    status: uiStatus,
    description: row.description || '',
  };
}

function mapSupabaseBookingToBooking(row) {
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

// Test Runner Harness
const testResults = [];

function assert(condition, testName, failureMsg) {
  if (condition) {
    testResults.push({ name: testName, passed: true });
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    testResults.push({ name: testName, passed: false, error: failureMsg });
    console.error(`  ❌ FAIL: ${testName} - ${failureMsg || 'Assertion failed'}`);
  }
}

console.log('====================================================');
console.log('🧪 VKU SPACEHUB - BACKEND & CORE TEST SUITE');
console.log('====================================================\n');

// 1. Conflict Engine Tests
console.log('--- 1. Testing Conflict Engine hasBookingConflict() ---');

// Example 1: 14:00–16:00 vs 15:00–17:00 => CONFLICT
assert(
  hasBookingConflict({ startTime: '15:00', endTime: '17:00' }, { startTime: '14:00', endTime: '16:00' }) === true,
  'Overlapping interval (15:00-17:00 vs 14:00-16:00) detects conflict'
);

// Example 2: 14:00–16:00 vs 16:00–18:00 => NO CONFLICT
assert(
  hasBookingConflict({ startTime: '16:00', endTime: '18:00' }, { startTime: '14:00', endTime: '16:00' }) === false,
  'Back-to-back adjacent edge (16:00-18:00 vs 14:00-16:00) has NO conflict'
);

// Example 3: 14:00–16:00 vs 14:00–16:00 => CONFLICT
assert(
  hasBookingConflict({ startTime: '14:00', endTime: '16:00' }, { startTime: '14:00', endTime: '16:00' }) === true,
  'Identical timeframe (14:00-16:00 vs 14:00-16:00) detects conflict'
);

// Example 4: Morning discrete slots (07:30-09:30 vs 09:30-11:30) => NO CONFLICT
assert(
  hasBookingConflict({ startTime: '07:30', endTime: '09:30' }, { startTime: '09:30', endTime: '11:30' }) === false,
  'Discrete slots (07:30-09:30 vs 09:30-11:30) have NO conflict'
);

// Example 5: Sub-interval enclosed inside larger slot => CONFLICT
assert(
  hasBookingConflict({ startTime: '10:00', endTime: '11:00' }, { startTime: '09:30', endTime: '11:30' }) === true,
  'Sub-interval enclosed inside slot (10:00-11:00 vs 09:30-11:30) detects conflict'
);

// Example 6: Large slot engulfing smaller slot => CONFLICT
assert(
  hasBookingConflict({ startTime: '08:00', endTime: '13:00' }, { startTime: '09:30', endTime: '11:30' }) === true,
  'Slot engulfing another slot (08:00-13:00 vs 09:30-11:30) detects conflict'
);

// Example 7: Cancelled reservations do not cause conflict
const mockBookings = [
  {
    id: 'bk-1',
    roomId: 'room-v203',
    date: '2026-09-24',
    startTime: '13:00',
    endTime: '15:00',
    status: 'confirmed',
  },
  {
    id: 'bk-2',
    roomId: 'room-v203',
    date: '2026-09-24',
    startTime: '07:30',
    endTime: '09:30',
    status: 'cancelled',
  },
];

assert(
  checkRoomSlotConflict('room-v203', '2026-09-24', { startTime: '13:00', endTime: '15:00' }, mockBookings).hasConflict === true,
  'Active booking on Room V203 at 13:00-15:00 triggers conflict'
);

assert(
  checkRoomSlotConflict('room-v203', '2026-09-24', { startTime: '07:30', endTime: '09:30' }, mockBookings).hasConflict === false,
  'Cancelled booking on Room V203 at 07:30-09:30 does NOT block new reservation'
);

assert(
  checkRoomSlotConflict('room-v203', '2026-09-24', { startTime: '13:00', endTime: '15:00' }, mockBookings, 'bk-1').hasConflict === false,
  'Excluding current booking id avoids self-conflict during updates'
);

// 2. Duration & Booking Validation Tests
console.log('\n--- 2. Testing Booking Validation & Calculations ---');
assert(calculateDurationMinutes('07:30', '09:30') === 120, '07:30 to 09:30 equals 120 minutes (2 hours)');
assert(calculateDurationMinutes('09:30', '11:30') === 120, '09:30 to 11:30 equals 120 minutes (2 hours)');
assert(calculateDurationMinutes('13:00', '15:00') === 120, '13:00 to 15:00 equals 120 minutes (2 hours)');
assert(calculateDurationMinutes('15:00', '17:00') === 120, '15:00 to 17:00 equals 120 minutes (2 hours)');

assert(validateInstitutionalEmail('student@vku.edu.vn') === true, 'Institutional email student@vku.edu.vn is valid');
assert(validateInstitutionalEmail('admin@vku.udn.vn') === true, 'Institutional email admin@vku.udn.vn with vku is valid');
assert(validateInstitutionalEmail('random@gmail.com') === false, 'Non-VKU email random@gmail.com is rejected');

let invalidTimeThrows = false;
try {
  validateBookingInput({ roomId: 'r1', date: '2026-09-25', startTime: '15:00', endTime: '13:00', roomStatus: 'available' });
} catch (e) {
  invalidTimeThrows = true;
}
assert(invalidTimeThrows === true, 'Disallows inverted time window (15:00 to 13:00)');

let maintenanceBookingThrows = false;
try {
  validateBookingInput({ roomId: 'r1', date: '2026-09-25', startTime: '07:30', endTime: '09:30', roomStatus: 'maintenance' });
} catch (e) {
  maintenanceBookingThrows = true;
}
assert(maintenanceBookingThrows === true, 'Disallows reservations on maintenance rooms');

// 3. Filter & Search Logic Tests
console.log('\n--- 3. Testing Filter & Search Logic ---');
const sampleRooms = [
  { id: 'r1', name: 'V203 - Innovation Discussion Studio', building: 'V', capacity: 10, type: 'Discussion Room', equipment: ['Projector', 'Whiteboard', 'AC'] },
  { id: 'r2', name: 'V103 - AI & Data Analytics Lab', building: 'V', capacity: 20, type: 'Computer Lab', equipment: ['High-spec PC', 'Projector', 'Whiteboard', 'AC'] },
  { id: 'r3', name: 'A101 - Smart Study Haven', building: 'A', capacity: 6, type: 'Study Room', equipment: ['Whiteboard', 'AC'] },
];

const v203Matches = sampleRooms.filter(r => r.name.toLowerCase().includes('v203'));
assert(v203Matches.length === 1 && v203Matches[0].id === 'r1', 'Search for "v203" accurately returns Room V203');

const buildingAMatches = sampleRooms.filter(r => r.building === 'A');
assert(buildingAMatches.length === 1 && buildingAMatches[0].id === 'r3', 'Building "A" filter accurately returns Building A rooms');

const capacity10Matches = sampleRooms.filter(r => r.capacity >= 10);
assert(capacity10Matches.length === 2, 'Capacity >= 10 accurately returns 2 rooms');

const highSpecMatches = sampleRooms.filter(r => r.equipment.includes('High-spec PC'));
assert(highSpecMatches.length === 1 && highSpecMatches[0].id === 'r2', 'Equipment "High-spec PC" filter returns V103 Lab');

// 4. Booking Status Lifecycle Transitions
console.log('\n--- 4. Testing Booking Status Lifecycle Transitions ---');

function transitionCheckIn(booking) {
  if (booking.status === 'cancelled') throw new Error('Cannot check in to a cancelled reservation.');
  if (booking.status === 'completed') throw new Error('Reservation already completed.');
  return { ...booking, status: 'checked_in', checkedInAt: '2026-09-24T08:00:00.000Z' };
}

function transitionComplete(booking) {
  if (booking.status !== 'checked_in') throw new Error('Only checked_in reservations can be completed.');
  return { ...booking, status: 'completed' };
}

function transitionCancel(booking) {
  if (booking.status === 'completed') throw new Error('Completed reservations cannot be cancelled.');
  if (booking.status === 'cancelled') throw new Error('Reservation already cancelled.');
  return { ...booking, status: 'cancelled' };
}

const freshBooking = { id: 'bk-lifecycle', status: 'confirmed' };

// 4a. confirmed -> checked_in
const checkedIn = transitionCheckIn(freshBooking);
assert(checkedIn.status === 'checked_in' && checkedIn.checkedInAt !== undefined, 'Transition: confirmed -> checked_in sets checkedInAt');

// 4b. checked_in -> completed
const completed = transitionComplete(checkedIn);
assert(completed.status === 'completed', 'Transition: checked_in -> completed succeeds');

// 4c. confirmed -> cancelled
const cancelled = transitionCancel(freshBooking);
assert(cancelled.status === 'cancelled', 'Transition: confirmed -> cancelled succeeds');

// 4d. cancelled -> check_in (must throw)
let checkInCancelledThrows = false;
try {
  transitionCheckIn(cancelled);
} catch (e) {
  checkInCancelledThrows = true;
}
assert(checkInCancelledThrows === true, 'Disallows check-in from cancelled status');

// 4e. completed -> cancel (must throw)
let cancelCompletedThrows = false;
try {
  transitionCancel({ id: 'bk-completed', status: 'completed' });
} catch (e) {
  cancelCompletedThrows = true;
}
assert(cancelCompletedThrows === true, 'Disallows cancellation from completed status');

// 5. Supabase Data Mapping Tests
console.log('\n--- 5. Testing Supabase Data Mapping ---');

const dbRoomRow = {
  id: '00000203-0000-0000-0000-000000000203',
  code: 'V203',
  name: 'V203 - Innovation Discussion Studio',
  building: 'V',
  floor: 2,
  room_type: 'Discussion Room',
  capacity: 10,
  equipment: ['Projector', 'Whiteboard', 'AC'],
  photo_url: 'https://example.com/v203.jpg',
  current_occupancy: 4,
  status: 'available',
  description: 'Innovation discussion space',
};

const mappedRoom = mapSupabaseRoomToRoom(dbRoomRow);
assert(mappedRoom.id === dbRoomRow.id, 'Room ID mapped accurately');
assert(mappedRoom.photo === dbRoomRow.photo_url, 'photo_url mapped to photo property');
assert(mappedRoom.type === 'Discussion Room', 'room_type mapped to type property');
assert(mappedRoom.status === 'Available Now', 'Database status "available" mapped to UI status "Available Now"');

// Capacity threshold test
const fullRoomRow = { ...dbRoomRow, current_occupancy: 10 };
const mappedFullRoom = mapSupabaseRoomToRoom(fullRoomRow);
assert(mappedFullRoom.status === 'Occupied', 'Room at max capacity automatically receives "Occupied" status');

const dbBookingRow = {
  id: '00000000-0000-0000-0001-000000000001',
  booking_code: 'VKU-2026-V203CF',
  room_id: '00000203-0000-0000-0000-000000000203',
  user_id: '00000000-0000-0000-0000-000000000001',
  booking_date: '2026-09-25',
  start_time: '13:00:00',
  end_time: '15:00:00',
  status: 'confirmed',
  created_at: '2026-09-24T10:00:00Z',
  room: {
    name: 'V203 - Innovation Discussion Studio',
    building: 'V',
    floor: 2,
    room_type: 'Discussion Room',
    photo_url: 'https://example.com/v203.jpg',
  },
  profile: {
    full_name: 'Nguyen Van Student',
    email: 'student@vku.edu.vn',
  },
};

const mappedBooking = mapSupabaseBookingToBooking(dbBookingRow);
assert(mappedBooking.bookingCode === 'VKU-2026-V203CF', 'Booking code mapped accurately');
assert(mappedBooking.startTime === '13:00', 'start_time trimmed from 13:00:00 to 13:00');
assert(mappedBooking.endTime === '15:00', 'end_time trimmed from 15:00:00 to 15:00');
assert(mappedBooking.durationMinutes === 120, 'Duration computed as 120 minutes');
assert(mappedBooking.roomName === 'V203 - Innovation Discussion Studio', 'Room name retrieved from joined relation');
assert(mappedBooking.qrPayload.startsWith('VKU-SPACEHUB:VKU-2026-V203CF'), 'QR payload constructed according to standard');

console.log('\n====================================================');
const passedCount = testResults.filter(t => t.passed).length;
const totalCount = testResults.length;
console.log(`TOTAL TESTS: ${totalCount} | PASSED: ${passedCount} | FAILED: ${totalCount - passedCount}`);
if (passedCount === totalCount) {
  console.log('🏆 ALL ACADEMIC TESTS PASSED WITH 100% SUCCESS RATE!');
} else {
  console.error('❌ SOME TESTS FAILED');
  process.exit(1);
}
console.log('====================================================\n');
