/**
 * VKU SpaceHub - Academic Verification Test Suite
 * Tests Pure Functions:
 * 1. hasBookingConflict() interval overlap algorithm
 * 2. checkRoomSlotConflict() with active & cancelled bookings
 * 3. Discrete 2-hour duration calculation
 * 4. Multi-facet filter logic (name, building, capacity, equipment)
 * 5. Booking status lifecycle transitions
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
console.log('🧪 VKU SPACEHUB - ACADEMIC VERIFICATION TEST SUITE');
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

// Example 6: Cancelled reservations do not cause conflict
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
    status: 'cancelled', // Cancelled
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

// 2. Duration Calculation Tests
console.log('\n--- 2. Testing Booking Duration Calculations ---');
assert(calculateDurationMinutes('07:30', '09:30') === 120, '07:30 to 09:30 equals 120 minutes (2 hours)');
assert(calculateDurationMinutes('09:30', '11:30') === 120, '09:30 to 11:30 equals 120 minutes (2 hours)');
assert(calculateDurationMinutes('13:00', '15:00') === 120, '13:00 to 15:00 equals 120 minutes (2 hours)');
assert(calculateDurationMinutes('15:00', '17:00') === 120, '15:00 to 17:00 equals 120 minutes (2 hours)');

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

function transitionCancel(booking) {
  if (booking.status === 'completed') throw new Error('Completed reservations cannot be cancelled.');
  return { ...booking, status: 'cancelled' };
}

const freshBooking = { id: 'bk-lifecycle', status: 'confirmed' };

// 4a. confirmed -> checked_in
const checkedIn = transitionCheckIn(freshBooking);
assert(checkedIn.status === 'checked_in' && checkedIn.checkedInAt !== undefined, 'Transition: confirmed -> checked_in sets checkedInAt');

// 4b. confirmed -> cancelled
const cancelled = transitionCancel(freshBooking);
assert(cancelled.status === 'cancelled', 'Transition: confirmed -> cancelled succeeds');

// 4c. cancelled -> check_in (must throw)
let checkInCancelledThrows = false;
try {
  transitionCheckIn(cancelled);
} catch (e) {
  checkInCancelledThrows = true;
}
assert(checkInCancelledThrows === true, 'Disallows check-in from cancelled status');

// 4d. completed -> cancel (must throw)
let cancelCompletedThrows = false;
try {
  transitionCancel({ id: 'bk-completed', status: 'completed' });
} catch (e) {
  cancelCompletedThrows = true;
}
assert(cancelCompletedThrows === true, 'Disallows cancellation from completed status');

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
