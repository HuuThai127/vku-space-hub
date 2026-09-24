import { hasBookingConflict, checkRoomSlotConflict } from '../conflictEngine';
import { calculateDurationMinutes, timeToMinutes } from '../dateUtils';
import { Booking, Room } from '../../types';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, testName: string, failureMsg?: string) {
  if (condition) {
    results.push({ name: testName, passed: true });
    console.log(`✅ PASS: ${testName}`);
  } else {
    results.push({ name: testName, passed: false, error: failureMsg || 'Assertion failed' });
    console.error(`❌ FAIL: ${testName} - ${failureMsg || 'Assertion failed'}`);
  }
}

export function runAllTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING VKU SPACEHUB ACADEMIC VERIFICATION TESTS');
  console.log('====================================================\n');

  // ==========================================
  // 1. CONFLICT ENGINE TESTS: hasBookingConflict()
  // ==========================================
  console.log('--- 1. Testing hasBookingConflict() Pure Utility ---');

  // Existing: 14:00–16:00, New: 15:00–17:00 => CONFLICT
  assert(
    hasBookingConflict({ startTime: '15:00', endTime: '17:00' }, { startTime: '14:00', endTime: '16:00' }) === true,
    'hasBookingConflict: Overlapping slot (15:00-17:00 vs 14:00-16:00) detects conflict'
  );

  // Existing: 14:00–16:00, New: 16:00–18:00 => NO CONFLICT (adjacent edges)
  assert(
    hasBookingConflict({ startTime: '16:00', endTime: '18:00' }, { startTime: '14:00', endTime: '16:00' }) === false,
    'hasBookingConflict: Back-to-back adjacent slot (16:00-18:00 vs 14:00-16:00) has NO conflict'
  );

  // Existing: 14:00–16:00, New: 14:00–16:00 => CONFLICT (identical interval)
  assert(
    hasBookingConflict({ startTime: '14:00', endTime: '16:00' }, { startTime: '14:00', endTime: '16:00' }) === true,
    'hasBookingConflict: Exact match slot (14:00-16:00 vs 14:00-16:00) detects conflict'
  );

  // Discrete slot 07:30-09:30 vs 09:30-11:30 => NO CONFLICT
  assert(
    hasBookingConflict({ startTime: '07:30', endTime: '09:30' }, { startTime: '09:30', endTime: '11:30' }) === false,
    'hasBookingConflict: Morning discrete slots (07:30-09:30 vs 09:30-11:30) have NO conflict'
  );

  // Sub-interval overlap: 10:00-11:00 inside 09:30-11:30 => CONFLICT
  assert(
    hasBookingConflict({ startTime: '10:00', endTime: '11:00' }, { startTime: '09:30', endTime: '11:30' }) === true,
    'hasBookingConflict: Inner sub-interval (10:00-11:00 inside 09:30-11:30) detects conflict'
  );

  // Cancelled bookings ignored in checkRoomSlotConflict
  const mockBookingList: Booking[] = [
    {
      id: 'bk-test-1',
      bookingCode: 'VKU-2026-TEST01',
      roomId: 'room-v203',
      roomName: 'V203',
      building: 'V',
      floor: 2,
      roomType: 'Discussion Room',
      roomPhoto: '',
      userId: 'usr-1',
      userName: 'Test User',
      userEmail: 'test@vku.edu.vn',
      date: '2026-09-24',
      startTime: '13:00',
      endTime: '15:00',
      durationMinutes: 120,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      qrPayload: 'test',
    },
    {
      id: 'bk-test-cancelled',
      bookingCode: 'VKU-2026-TEST02',
      roomId: 'room-v203',
      roomName: 'V203',
      building: 'V',
      floor: 2,
      roomType: 'Discussion Room',
      roomPhoto: '',
      userId: 'usr-2',
      userName: 'Test User 2',
      userEmail: 'test2@vku.edu.vn',
      date: '2026-09-24',
      startTime: '07:30',
      endTime: '09:30',
      durationMinutes: 120,
      status: 'cancelled', // Cancelled!
      createdAt: new Date().toISOString(),
      qrPayload: 'test',
    },
  ];

  const conflictOnActive = checkRoomSlotConflict(
    'room-v203',
    '2026-09-24',
    { startTime: '13:00', endTime: '15:00' },
    mockBookingList
  );
  assert(
    conflictOnActive.hasConflict === true,
    'checkRoomSlotConflict: Confirmed booking detects conflict on V203 13:00-15:00'
  );

  const conflictOnCancelled = checkRoomSlotConflict(
    'room-v203',
    '2026-09-24',
    { startTime: '07:30', endTime: '09:30' },
    mockBookingList
  );
  assert(
    conflictOnCancelled.hasConflict === false,
    'checkRoomSlotConflict: Cancelled booking does NOT block new reservation'
  );

  // ==========================================
  // 2. DURATION CALCULATION TESTS
  // ==========================================
  console.log('\n--- 2. Testing Booking Duration Calculations ---');

  assert(
    calculateDurationMinutes('07:30', '09:30') === 120,
    'calculateDurationMinutes: 07:30 - 09:30 equals 120 minutes'
  );
  assert(
    calculateDurationMinutes('09:30', '11:30') === 120,
    'calculateDurationMinutes: 09:30 - 11:30 equals 120 minutes'
  );
  assert(
    calculateDurationMinutes('13:00', '15:00') === 120,
    'calculateDurationMinutes: 13:00 - 15:00 equals 120 minutes'
  );
  assert(
    calculateDurationMinutes('15:00', '17:00') === 120,
    'calculateDurationMinutes: 15:00 - 17:00 equals 120 minutes'
  );

  // ==========================================
  // 3. FILTER LOGIC TESTS
  // ==========================================
  console.log('\n--- 3. Testing Filter & Search Logic ---');

  const sampleRooms: Room[] = [
    {
      id: 'r1',
      name: 'V203 - Innovation Discussion Studio',
      building: 'V',
      floor: 2,
      capacity: 10,
      type: 'Discussion Room',
      equipment: ['Projector', 'Whiteboard', 'AC'],
      currentOccupancy: 4,
      status: 'Available Now',
      description: 'VKU innovation zone',
      photo: '',
    },
    {
      id: 'r2',
      name: 'V103 - AI & Data Analytics Lab',
      building: 'V',
      floor: 1,
      capacity: 20,
      type: 'Computer Lab',
      equipment: ['High-spec PC', 'Projector', 'Whiteboard', 'AC'],
      currentOccupancy: 10,
      status: 'Available Now',
      description: 'GPU lab',
      photo: '',
    },
    {
      id: 'r3',
      name: 'A101 - Smart Study Haven',
      building: 'A',
      floor: 1,
      capacity: 6,
      type: 'Study Room',
      equipment: ['Whiteboard', 'AC'],
      currentOccupancy: 2,
      status: 'Available Now',
      description: 'Quiet room',
      photo: '',
    },
  ];

  // Search by room name
  const searchV203 = sampleRooms.filter((r) => r.name.toLowerCase().includes('v203'));
  assert(searchV203.length === 1 && searchV203[0].id === 'r1', 'FilterLogic: Search "V203" returns exactly Room V203');

  // Search by building
  const searchBuildingA = sampleRooms.filter((r) => r.building === 'A');
  assert(searchBuildingA.length === 1 && searchBuildingA[0].id === 'r3', 'FilterLogic: Building A filter returns Room A101');

  // Filter by capacity >= 10
  const capacity10 = sampleRooms.filter((r) => r.capacity >= 10);
  assert(capacity10.length === 2, 'FilterLogic: Capacity >= 10 returns 2 matching rooms');

  // Filter by equipment High-spec PC
  const highSpecFilter = sampleRooms.filter((r) => r.equipment.includes('High-spec PC'));
  assert(highSpecFilter.length === 1 && highSpecFilter[0].id === 'r2', 'FilterLogic: High-spec PC filter returns V103 Lab');

  // ==========================================
  // 4. BOOKING STATUS TRANSITIONS
  // ==========================================
  console.log('\n--- 4. Testing Booking Status Transitions ---');

  let stateBooking: Booking = { ...mockBookingList[0], status: 'confirmed' };

  // Transition: confirmed -> checked_in
  function simulateCheckIn(b: Booking): Booking {
    if (b.status === 'cancelled') throw new Error('Cannot check in to a cancelled reservation.');
    if (b.status === 'completed') throw new Error('Reservation already completed.');
    return { ...b, status: 'checked_in', checkedInAt: new Date().toISOString() };
  }

  // Transition: confirmed -> cancelled
  function simulateCancel(b: Booking): Booking {
    if (b.status === 'completed') throw new Error('Completed reservations cannot be cancelled.');
    return { ...b, status: 'cancelled' };
  }

  // 4a. Check-in from confirmed succeeds
  const checkedInBooking = simulateCheckIn(stateBooking);
  assert(
    checkedInBooking.status === 'checked_in' && !!checkedInBooking.checkedInAt,
    'StatusTransition: confirmed -> checked_in sets status and checkedInAt timestamp'
  );

  // 4b. Cancellation from confirmed succeeds
  const cancelledBooking = simulateCancel(stateBooking);
  assert(
    cancelledBooking.status === 'cancelled',
    'StatusTransition: confirmed -> cancelled sets status to cancelled'
  );

  // 4c. Check-in from cancelled is rejected
  let checkInCancelledError = false;
  try {
    simulateCheckIn(cancelledBooking);
  } catch {
    checkInCancelledError = true;
  }
  assert(
    checkInCancelledError === true,
    'StatusTransition: check-in is rejected when booking is cancelled'
  );

  // 4d. Cancellation from completed is rejected
  let cancelCompletedError = false;
  try {
    simulateCancel({ ...stateBooking, status: 'completed' });
  } catch {
    cancelCompletedError = true;
  }
  assert(
    cancelCompletedError === true,
    'StatusTransition: cancellation is rejected when booking is completed'
  );

  console.log('\n====================================================');
  const allPassed = results.every((r) => r.passed);
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${results.filter((r) => r.passed).length} | FAILED: ${results.filter((r) => !r.passed).length}`);
  console.log(allPassed ? '🎉 ALL ACADEMIC TESTS PASSED!' : '❌ SOME TESTS FAILED');
  console.log('====================================================\n');

  return allPassed;
}
