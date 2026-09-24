# VKU SpaceHub 🚀
### Campus Room & Computer Lab Booking Manager
**Vietnam - Korea University of Information and Communication Technology (VKU)**

---

## 1. Project Overview & Business Problem
VKU SpaceHub is a mobile application developed for students and faculty of the Vietnam - Korea University of Information and Communication Technology (VKU). 

### The Problem:
With growing student enrollment and high demand for specialized facilities (AI Labs, IoT Testing Benches, Collaborative Discussion Rooms, and Quiet Study Pods), students frequently face:
- Uncertainty regarding real-time room occupancy and equipment availability.
- Scheduling conflicts, double-bookings, and room hoarding.
- Lack of physical attendance verification and check-in confirmation.
- Missed sessions due to forgotten reservation times.

### The Solution:
VKU SpaceHub delivers an end-to-end mobile booking system allowing students to discover 12+ university spaces across Buildings A, B, C, and V, filter by equipment and capacity, reserve discrete 2-hour slots with zero-conflict guarantees, receive local push notification reminders 15 minutes prior to start, and check in securely using digital QR passes.

---

## 2. Academic Learning Objectives & Implementation Mapping

| Academic Requirement | Architecture & Implementation Details | Code Artifacts |
| :--- | :--- | :--- |
| **High-Performance React Native + Expo** | Modern Expo SDK 57 project strictly compatible with Expo Go. | [App.tsx](file:///e:/Projects/VKU-SpaceHub/App.tsx), [package.json](file:///e:/Projects/VKU-SpaceHub/package.json) |
| **Global Booking State** | Zustand store managing active reservations, history, and check-in. | [useBookingStore.ts](file:///e:/Projects/VKU-SpaceHub/src/store/useBookingStore.ts) |
| **User Session Persistence** | Student authentication with AsyncStorage session persistence. | [authService.ts](file:///e:/Projects/VKU-SpaceHub/src/services/authService.ts), [storageService.ts](file:///e:/Projects/VKU-SpaceHub/src/services/storageService.ts) |
| **Active Multi-Facet Filters** | Global search, building, capacity, and equipment filter state in Zustand. | [useFilterStore.ts](file:///e:/Projects/VKU-SpaceHub/src/store/useFilterStore.ts) |
| **High-Performance List** | `FlatList` with `removeClippedSubviews`, optimized window sizes, and stable keys. | [DiscoverScreen.tsx](file:///e:/Projects/VKU-SpaceHub/src/screens/discover/DiscoverScreen.tsx) |
| **Memoized Components** | `React.memo` wrapping room cards to eliminate redundant renders. | [RoomCard.tsx](file:///e:/Projects/VKU-SpaceHub/src/components/rooms/RoomCard.tsx) |
| **Time-Slot Conflict Prevention** | Pure mathematical interval overlap engine applied at UI and Service layers. | [conflictEngine.ts](file:///e:/Projects/VKU-SpaceHub/src/utils/conflictEngine.ts) |
| **Local Push Reminders** | `expo-notifications` scheduling reminders 15 mins prior to reservation. | [notificationService.ts](file:///e:/Projects/VKU-SpaceHub/src/services/notificationService.ts) |
| **Dynamic 7-Day Date Selector** | Dynamically calculated 7 calendar days starting from current date. | [DateSelector.tsx](file:///e:/Projects/VKU-SpaceHub/src/components/rooms/DateSelector.tsx), [dateUtils.ts](file:///e:/Projects/VKU-SpaceHub/src/utils/dateUtils.ts) |
| **Discrete 2-Hour Time Slots** | 07:30–09:30, 09:30–11:30, 13:00–15:00, 15:00–17:00 with visual disabled states. | [TimeSlotCard.tsx](file:///e:/Projects/VKU-SpaceHub/src/components/rooms/TimeSlotCard.tsx) |
| **Digital QR Booking Pass** | Boarding-pass UI generating QR code with tamper-safe booking payload. | [BookingPassCard.tsx](file:///e:/Projects/VKU-SpaceHub/src/components/booking/BookingPassCard.tsx) |
| **Interactive QR Check-In Modal** | Scanner simulation updating status from `confirmed` → `checked_in`. | [QRCodeModal.tsx](file:///e:/Projects/VKU-SpaceHub/src/components/booking/QRCodeModal.tsx), [QRCheckInScreen.tsx](file:///e:/Projects/VKU-SpaceHub/src/screens/booking/QRCheckInScreen.tsx) |
| **AsyncStorage Persistence** | Local device cache for session, booking ledger, and in-app notifications. | [storageService.ts](file:///e:/Projects/VKU-SpaceHub/src/services/storageService.ts) |

---

## 3. Technology Stack

- **Core**: React Native 0.86.3, Expo SDK 57, TypeScript 6.0
- **Navigation**: React Navigation 7 (Native Stack + Bottom Tabs)
- **State Management**: Zustand 5
- **Persistence**: `@react-native-async-storage/async-storage`
- **Notifications**: `expo-notifications`
- **Vector Graphics & QR**: `react-native-svg`, `react-native-qrcode-svg`, `@expo/vector-icons`
- **Aesthetics & Tokens**: Strict custom design system with VKU brand palette, responsive elevation shadows, and accessible contrast.

---

## 4. System Architecture & Flow

```
┌────────────────────────────────────────────────────────┐
│                   VKU SpaceHub UI                      │
│   (Screens: Splash, Login, Home, Discover, Detail,     │
│    Confirmation, Success, Pass, CheckIn, History)      │
└───────────────▲────────────────────────▲───────────────┘
                │                        │
       Zustand Selectors         Zustand Actions
                │                        │
┌───────────────▼────────────────────────▼───────────────┐
│                    Zustand Stores                      │
│  useBookingStore | useFilterStore | useRoomStore       │
└───────────────▲────────────────────────▲───────────────┘
                │                        │
        Business Logic          Storage Invocation
                │                        │
┌───────────────▼────────────────────────▼───────────────┐
│                    Service Layer                       │
│  authService | roomService | bookingService            │
│  notificationService | storageService                  │
└───────────────▲────────────────────────▲───────────────┘
                │                        │
┌───────────────▼─────────┐    ┌─────────▼───────────────┐
│     Conflict Engine     │    │      AsyncStorage       │
│  hasBookingConflict()   │    │  (Session & Bookings)   │
└─────────────────────────┘    └─────────────────────────┘
```

---

## 5. Directory Structure

```
E:\Projects\VKU-SpaceHub
├── App.tsx
├── app.json
├── package.json
├── tsconfig.json
├── src
│   ├── components
│   │   ├── booking
│   │   │   ├── BookingCard.tsx
│   │   │   ├── BookingPassCard.tsx
│   │   │   └── QRCodeModal.tsx
│   │   ├── common
│   │   │   ├── AppButton.tsx
│   │   │   ├── AppInput.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorState.tsx
│   │   │   ├── FilterChip.tsx
│   │   │   ├── LoadingState.tsx
│   │   │   ├── ScreenHeader.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── StatusBadge.tsx
│   │   └── rooms
│   │       ├── DateSelector.tsx
│   │       ├── RoomCard.tsx (React.memo)
│   │       └── TimeSlotCard.tsx
│   ├── constants
│   │   ├── mockData.ts
│   │   └── theme.ts
│   ├── navigation
│   │   ├── MainTabs.tsx
│   │   ├── RootNavigator.tsx
│   │   └── types.ts
│   ├── screens
│   │   ├── auth
│   │   │   ├── LoginScreen.tsx
│   │   │   └── SplashScreen.tsx
│   │   ├── booking
│   │   │   ├── BookingConfirmationScreen.tsx
│   │   │   ├── BookingPassScreen.tsx
│   │   │   ├── BookingSuccessScreen.tsx
│   │   │   └── QRCheckInScreen.tsx
│   │   ├── discover
│   │   │   └── DiscoverScreen.tsx
│   │   ├── home
│   │   │   └── HomeScreen.tsx
│   │   ├── notifications
│   │   │   └── NotificationsScreen.tsx
│   │   ├── profile
│   │   │   └── ProfileScreen.tsx
│   │   ├── reservations
│   │   │   └── ReservationsScreen.tsx
│   │   └── room
│   │       └── RoomDetailScreen.tsx
│   ├── services
│   │   ├── authService.ts
│   │   ├── bookingService.ts
│   │   ├── notificationService.ts
│   │   ├── roomService.ts
│   │   └── storageService.ts
│   ├── store
│   │   ├── useBookingStore.ts
│   │   ├── useFilterStore.ts
│   │   ├── useNotificationStore.ts
│   │   └── useRoomStore.ts
│   ├── types
│   │   └── index.ts
│   └── utils
│       ├── __tests__
│       │   ├── runTests.js
│       │   └── verification.ts
│       ├── conflictEngine.ts
│       └── dateUtils.ts
```

---

## 6. Mathematical Conflict Logic: `hasBookingConflict()`

To prevent double bookings and overlapping reservations across the campus, the application evaluates time intervals:

$$\text{Conflict} \iff (T_{\text{new\_start}} < T_{\text{existing\_end}}) \land (T_{\text{new\_end}} > T_{\text{existing\_start}})$$

Where time strings `HH:mm` are converted to integer minutes from `00:00`.

### Conflict Scenarios:
1. **Overlap**: Existing: `14:00–16:00`, New: `15:00–17:00` $\implies$ **CONFLICT** (15:00 < 16:00 and 17:00 > 14:00).
2. **Adjacent Edges**: Existing: `14:00–16:00`, New: `16:00–18:00` $\implies$ **NO CONFLICT** (16:00 is not strictly less than 16:00).
3. **Identical**: Existing: `14:00–16:00`, New: `14:00–16:00` $\implies$ **CONFLICT**.

### Multi-Tiered Verification:
- **Tier 1 (UI Layer)**: `TimeSlotCard` disables booked slots visibly and prevents selection.
- **Tier 2 (Screen Pre-Check)**: `BookingConfirmationScreen` validates again before enabling submission.
- **Tier 3 (Service Layer)**: `bookingService.createBooking()` re-queries the persistent ledger and throws an explicit `Error` if a race condition or conflict is detected.

---

## 7. Notification Flow

1. Student completes booking confirmation.
2. `notificationService.scheduleBookingReminder()` computes the exact Unix timestamp 15 minutes before the booking start time.
3. If notification permissions are granted, `expo-notifications` registers the scheduled alert.
4. If permissions are denied by the user, the error is handled gracefully and the booking continues successfully.
5. The unique `notificationId` is stored in the booking record.
6. When a user cancels a reservation, `notificationService.cancelNotification()` cancels the scheduled reminder.

---

## 8. Real-Time Occupancy Simulation

The `roomService` provides an event-driven observer pattern:
```typescript
roomService.subscribeToRoomAvailability((updatedRooms: Room[]) => {
  // Updates room list in memory & triggers reactive UI rendering
});
```
This architecture mirrors a production WebSocket / SSE client, making it straightforward to connect to a backend server in the future.

---

## 9. How to Run the Application

### 1. Run Academic Verification Tests
```bash
npm test
```
*Executes all 19 unit test assertions covering the conflict engine, duration math, filtering algorithms, and status state machine.*

### 2. Run TypeScript Diagnostic
```bash
npx tsc --noEmit
```

### 3. Run Expo Doctor Diagnostic
```bash
npx expo-doctor
```

### 4. Start Expo Development Server
```bash
npx expo start
```
*Open **Expo Go** on your physical iOS/Android phone and scan the QR code displayed in the terminal.*

---

## 10. Step-by-Step Demo Flow

Follow this exact sequence to demonstrate all required capabilities:

1. **Authentication**:
   - Open app $\rightarrow$ Splash screen runs with VKU branding and session restoration.
   - On Login screen, tap **"Quick Login as Nguyen Van Student"**.
2. **Home Screen**:
   - Greeted as **Nguyen Van Student**.
   - Review upcoming reservations and quick building filter tabs.
3. **Room Discovery & Search**:
   - Tap **Discover** tab.
   - Enter **`V203`** in the search bar.
   - The room feed instantly isolates **V203 - Innovation Discussion Studio**.
4. **Room Detail & 7-Day Selector**:
   - Tap Room V203 card.
   - Observe the 7-day horizontal date selector.
   - Observe discrete 2-hour slots (`07:30-09:30`, `09:30-11:30`, `13:00-15:00`, `15:00-17:00`).
5. **Conflict Scenario Demonstration**:
   - On the current date, observe that slot **`13:00–15:00`** has a "Booked" badge and is disabled (pre-booked in mock ledger by student Le Thi Academic).
   - Tapping it alerts: *"Time Slot Unavailable"*.
6. **Successful Booking**:
   - Select an available slot (e.g. `15:00 - 17:00` or select tomorrow's date and pick `13:00 - 15:00`).
   - Tap **"Proceed to Booking"**.
   - Review the summary on **BookingConfirmationScreen** $\rightarrow$ tap **"Confirm Reservation"**.
7. **Success & Digital Pass**:
   - Lands on **BookingSuccessScreen** with generated ID (e.g., `VKU-2026-A7F92C`).
   - Tap **"View Digital QR Pass"** $\rightarrow$ renders the boarding-pass card with QR code.
8. **Interactive QR Check-In**:
   - Tap **"Scan / Check In Now"** $\rightarrow$ opens the interactive QR Check-in modal.
   - Tap **"Simulate Scanner Check-In"**.
   - Status updates from **Confirmed** $\rightarrow$ **Checked In** with recorded `checkedInAt` timestamp.
9. **Reservations & Cancellation**:
   - Navigate to the **Bookings** tab.
   - Toggle between **Upcoming** and **History**.
   - Select another confirmed booking and tap **Cancel** $\rightarrow$ confirmation dialog prompts user $\rightarrow$ status updates to **Cancelled** and slot becomes available again.
10. **Notifications & Profile**:
    - Tap **Alerts** tab $\rightarrow$ see in-app records of created bookings, reminders, and check-ins.
    - Tap **Profile** tab $\rightarrow$ review student metrics and sign out.

---

## 11. Known Limitations & Future Enhancements

- **Backend**: Currently runs entirely locally on mock data and AsyncStorage. Production versions will integrate a NestJS/Express REST + WebSocket API.
- **Physical Camera Scanner**: Simulated door scanner modal is provided for grading demonstration; future versions can incorporate `expo-camera` for real-time barcode scanning.
- **Room Floorplans**: Future releases can integrate interactive SVG campus indoor maps.
