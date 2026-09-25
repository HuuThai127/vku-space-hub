# MINI-PROJECT SHORT TECHNICAL REPORT

**Course:** Cross-Platform Mobile App Development (VKU)

**Mini-Project Title:** Mini-Project 2 – VKU SpaceHub: Campus Room & Computer Lab Booking Manager

**Team / Student Name:** Le Huu Thai

**Submission Date:** 24/09/2026

---

## 1. GENERAL INFORMATION & DELIVERABLE LINKS

### Team Members

1. **Le Huu Thai** — Student ID: 23IT.EB091 — Role: Frontend Architecture & State Management — Contribution: 100%

### Deliverable Links

- **Live Demo URL:** [https://vku-space-hub.vercel.app](https://vku-space-hub.vercel.app)
- **GitHub Repository:** [https://github.com/HuuThai127/vku-space-hub](https://github.com/HuuThai127/vku-space-hub)
- **Video Demo:** [https://drive.google.com/file/d/14KIY_okh8UHoNO_pgYAlJpz4p1nZ6r3c/view?usp=sharing](https://drive.google.com/file/d/14KIY_okh8UHoNO_pgYAlJpz4p1nZ6r3c/view?usp=sharing)

---

## 2. FEATURE IMPLEMENTATION CHECKLIST

| # | Required Feature | Status | Implementation Details & Acceptance Level |
|:---:|---|:---:|---|
| 1 | React Native + Expo application | ✅ Complete | Initialized with Expo SDK 57 and React Native 0.86.3. Runs seamlessly on mobile (iOS/Android) and Web. Built with Metro bundler and deployed as a responsive single-page web app. Referenced: `package.json`, `app.json`, `App.tsx`. |
| 2 | Global user session management with Zustand & Supabase Auth | ✅ Complete | Integrates Supabase Auth (`signInWithPassword`, `signUp`, `getSession`, `onAuthStateChange`) with Zustand session synchronization. Fetches and maintains profile metadata from PostgreSQL `public.profiles`. Referenced: `src/store/useBookingStore.ts`, `src/services/authService.ts`. |
| 3 | Global booking state with Zustand | ✅ Complete | Centralized store managing active reservations, booking history, and campus-wide slot availability backed authoritatively by Supabase PostgreSQL `public.bookings`. Referenced: `src/store/useBookingStore.ts`, `src/services/bookingService.ts`. |
| 4 | Global search/filter state with Zustand | ✅ Complete | Multi-facet filter store maintaining text search queries, building codes, capacity thresholds, room types, lab equipment tags, and calendar date selections. Referenced: `src/store/useFilterStore.ts`. |
| 5 | High-performance FlatList | ✅ Complete | Virtualized list rendering for room catalogues and reservation passes with optimized windowing, memoized render items, and stable key extractors. Referenced: `src/screens/discover/DiscoverScreen.tsx`, `src/screens/reservations/ReservationsScreen.tsx`. |
| 6 | React.memo RoomCard | ✅ Complete | Room display card wrapped with `React.memo` to eliminate unnecessary re-renders when parent states change during scroll or search filtering. Referenced: `src/components/rooms/RoomCard.tsx`. |
| 7 | Search functionality | ✅ Complete | Real-time query search filtering rooms dynamically across names, room codes (e.g. A101, V203), and laboratory descriptions. Referenced: `src/components/common/SearchBar.tsx`, `src/screens/discover/DiscoverScreen.tsx`. |
| 8 | Multi-facet filters | ✅ Complete | Modal filter system supporting building selection (A, B, C, V), room types (Study Room, Discussion Room, Computer Lab), minimum capacity, and required equipment. Referenced: `src/components/rooms/FilterModal.tsx`, `src/store/useFilterStore.ts`. |
| 9 | Dynamic 7-day date selector | ✅ Complete | Horizontal calendar strip dynamically calculating the upcoming 7 consecutive calendar days with day-of-week labels and month indicators. Referenced: `src/components/rooms/DateSelector.tsx`, `src/utils/dateUtils.ts`. |
| 10 | Discrete 2-hour time slots | ✅ Complete | Structured academic booking blocks (`07:30–09:30`, `09:30–11:30`, `13:00–15:00`, `15:00–17:00`) with visual indicators for selected, booked, and available states. Referenced: `src/components/rooms/TimeSlotCard.tsx`, `src/utils/dateUtils.ts`. |
| 11 | Two-level time-slot conflict prevention | ✅ Complete | Dual-layer validation: (1) immediate client-side interval-overlap check for responsive UX feedback; (2) authoritative PostgreSQL `create_booking()` RPC executing row-level locks (`FOR UPDATE`) and interval overlap queries on the database. Referenced: `src/utils/conflictEngine.ts`, `src/services/bookingService.ts`, `supabase/migrations/001_initial_schema.sql`. |
| 12 | Booking creation | ✅ Complete | Full reservation workflow featuring booking confirmation, payload assembly, atomic RPC execution, and real-time state update. Referenced: `src/screens/booking/BookingConfirmationScreen.tsx`, `src/store/useBookingStore.ts`. |
| 13 | Booking cancellation | ✅ Complete | Interactive cancellation flow with user confirmation alert, status transition to `cancelled` in Supabase, automatic slot release, and scheduled local notification cancellation. Referenced: `src/screens/reservations/ReservationsScreen.tsx`, `src/store/useBookingStore.ts`. |
| 14 | Unique booking pass | ✅ Complete | Generation of academic pass records containing unique booking codes (`VKU-YYYY-XXXXXX`), room details, student identifier, time window, and verification payload. Referenced: `src/screens/booking/BookingPassScreen.tsx`, `src/screens/booking/BookingSuccessScreen.tsx`. |
| 15 | QR check-in modal | ✅ Complete | Renders scannable SVG QR codes encoded with booking verification payloads (`VKU-SPACEHUB:CODE:ROOM:DATE:TIME`) and verified check-in status transitions. Referenced: `src/screens/booking/QRCheckInScreen.tsx`. |
| 16 | Dual notification architecture | ✅ Complete | Dual-layer: Expo Notifications schedules local device reminders 15 minutes before sessions; Supabase `public.notifications` stores persistent cross-device notification history and read tracking. Graceful fallback on web. Referenced: `src/services/notificationService.ts`, `src/store/useNotificationStore.ts`. |
| 17 | Local session & cache persistence | ✅ Complete | AsyncStorage acts as the local session token cache for Supabase Auth and temporary offline cache. Authoritative booking data is persisted in Supabase PostgreSQL. Referenced: `src/services/storageService.ts`, `src/lib/supabase.ts`. |
| 18 | Real-time availability & subscriptions | ✅ Complete | Supabase Realtime channels (`public:rooms` and `public:bookings`) broadcast database changes to update room occupancy and slot availability across connected clients. Includes offline fallback simulation. Referenced: `src/services/roomService.ts`, `src/services/bookingService.ts`. |
| 19 | Loading/error/empty states | ✅ Complete | Comprehensive visual feedback with activity spinners, "No rooms found" filter empty states, and "No active reservations" tab placeholders. Referenced: `src/components/common/LoadingIndicator.tsx`, `src/screens/discover/DiscoverScreen.tsx`. |
| 20 | TypeScript validation | ✅ Complete | Strict typing across domain models, Supabase database mappings, navigation parameters, and UI components with zero type errors (`npx tsc --noEmit`). Referenced: `src/types/index.ts`, `src/navigation/types.ts`, `tsconfig.json`. |
| 21 | Automated test suite | ✅ Complete | Complete test suite containing 38 test cases covering mathematical interval overlap, booking validation, lifecycle transitions, filtering, and Supabase data mappers with 100% pass rate. Referenced: `src/utils/__tests__/runTests.js`. |

---

## 3. TECHNICAL ARCHITECTURE & PROJECT STRUCTURE

### 3.1 Technology Stack

The project dependencies and runtime tools are specified in `package.json`:

- **React Native (`0.86.3`)**: Core mobile component hierarchy and cross-platform bridge.
- **Expo SDK (`~57.0.25`)**: Cross-platform runtime, asset pipeline, and bundler tooling.
- **TypeScript (`~6.0.3`)**: Static typing, strict null safety, and interface contracts.
- **Zustand (`^5.0.15`)**: Predictable, lightweight state management decoupled from UI components.
- **React Navigation (`^7.4.1`)**: Native stack (`^7.19.2`) and bottom tab (`^7.19.2`) routing.
- **Supabase JS Client (`@supabase/supabase-js ^2.117.1`)**: Cloud database client interfacing with Supabase Auth, PostgreSQL Data API, Row-Level Security, and Realtime WebSocket channels.
- **Supabase PostgreSQL Backend**: Cloud database hosting relational tables, indexes, and authoritative PL/pgSQL stored procedures.
- **AsyncStorage (`2.2.0`)**: Local storage adapter utilized by Supabase Auth for session tokens and local offline caching.
- **Expo Notifications (`~57.0.21`)**: Native hardware scheduling for session reminder alerts.
- **React Native Web (`^0.21.2`)**: Web abstraction layer compiling React Native components to HTML5 DOM.
- **React Native SVG (`15.15.4`) & QR Code SVG (`^6.3.26`)**: Vector rendering engine generating scannable QR passes.

### 3.2 Project Structure

The project follows a modular, feature-oriented layered structure:

```
E:\Projects\VKU-SpaceHub
├── assets/                  # App icons, splash screens, and adaptive assets
├── dist/                    # Static production bundle exported for Vercel web deployment
├── docs/                    # Architecture and backend documentation (SUPABASE_SETUP.md)
├── screenshots/             # Interface evidence referenced by technical documentation
├── src/
│   ├── components/          # Reusable presentation and domain components
│   │   ├── booking/         # BookingCard and reservation summary cards
│   │   ├── common/          # AppButton, FilterChip, SearchBar, StatusBadge, ScreenHeader
│   │   └── rooms/           # DateSelector, TimeSlotCard, RoomCard, FilterModal
│   ├── constants/           # Seed records (mockData.ts) and style tokens (theme.ts)
│   ├── lib/                 # Third-party client configuration (supabase.ts)
│   ├── navigation/          # RootNavigator (NativeStack), MainTabs (BottomTabs), navigation types
│   ├── screens/             # Screen modules organized by user journey
│   │   ├── auth/            # SplashScreen, LoginScreen (Sign In & Sign Up)
│   │   ├── booking/         # BookingConfirmationScreen, BookingSuccessScreen, BookingPassScreen, QRCheckInScreen
│   │   ├── discover/        # DiscoverScreen (room discovery, search, filter)
│   │   ├── home/            # HomeScreen (student overview, active session, quick booking)
│   │   ├── notifications/   # NotificationsScreen (system alerts, booking history)
│   │   ├── profile/         # ProfileScreen (account status, institution details, sign out)
│   │   ├── reservations/    # ReservationsScreen (upcoming and historical passes)
│   │   └── room/            # RoomDetailScreen (slot picker and specifications)
│   ├── services/            # Service abstraction layer interfacing with Supabase and APIs
│   │   ├── authService.ts         # Supabase Auth & profile synchronization
│   │   ├── bookingService.ts      # Supabase bookings & create_booking RPC
│   │   ├── notificationService.ts # Supabase notification metadata & Expo Notifications
│   │   ├── roomService.ts         # Supabase rooms & Realtime subscriptions
│   │   └── storageService.ts      # AsyncStorage session/token caching
│   ├── store/               # Zustand state stores (useBookingStore, useFilterStore, etc.)
│   ├── types/               # TypeScript interfaces for data entities and navigation
│   └── utils/               # Pure helper utilities, conflict engine, and unit tests
│       └── __tests__/       # Automated test suite (runTests.js)
├── supabase/                # Cloud database definitions
│   ├── migrations/          # 001_initial_schema.sql (Tables, RLS, RPC, Triggers)
│   └── seed.sql             # 12 rooms, 12 bookings, demo users, notifications
├── .env.example             # Clean placeholder configuration for Supabase environment keys
├── App.tsx                  # Root application wrapper with NavigationContainer
├── app.json                 # Expo configuration manifest
├── package.json             # Scripts and versioned dependencies
├── tsconfig.json            # TypeScript compiler configuration
└── vercel.json              # Public Vercel SPA build command and rewrite configuration
```

### 3.3 System Architecture & State Management

VKU SpaceHub adopts a multi-tier data flow where Zustand serves as the application state layer and Supabase serves as the authoritative cloud backend:

```
[ React Native / Expo UI: Screens & Components ]
                       │
             (Dispatches actions)
                       ▼
[ Zustand Global State ]
  ├── useBookingStore.ts      ──> User session, active/history reservations
  ├── useFilterStore.ts       ──> Multi-facet search query, building, capacity
  ├── useRoomStore.ts         ──> Campus rooms list, real-time availability
  └── useNotificationStore.ts ──> Unread counter, system alerts, read flags
                       │
               (Calls service API)
                       ▼
[ Service Abstraction Layer ]
  ├── authService.ts          ──> Supabase Auth (signInWithPassword, signUp)
  ├── bookingService.ts       ──> Authoritative booking queries & create_booking RPC
  ├── roomService.ts          ──> Room catalog & Supabase Realtime channel
  ├── notificationService.ts  ──> Persistent metadata + Expo Notifications
  └── storageService.ts       ──> AsyncStorage session token caching
                       │
                (REST / WebSocket)
                       ▼
[ Supabase Client (src/lib/supabase.ts) ]
                       │
             (Enforces RLS Policies)
                       ▼
[ Supabase Cloud PostgreSQL / Auth / Realtime ]
  ├── auth.users              ──> Identity management & password hashes
  ├── public.profiles         ──> Student profile data (id references auth.users)
  ├── public.rooms            ──> Campus room inventory & live occupancy
  ├── public.bookings         ──> Authoritative reservations & check-in stamps
  ├── public.notifications    ──> Cross-device notification records
  └── PostgreSQL Stored Proc  ──> create_booking() atomic concurrency control
```

#### Service Responsibilities
1. **`authService.ts`**: Connects to `supabase.auth`, authenticating students with email and password, creating corresponding rows in `public.profiles`, and restoring active sessions on launch.
2. **`roomService.ts`**: Queries `public.rooms`, maps database rows to TypeScript domain models, and subscribes to real-time database updates via `supabase.channel('public:rooms')`.
3. **`bookingService.ts`**: Coordinates reservations by executing the authoritative `create_booking()` RPC, querying bookings with relational joins on `rooms` and `profiles`, and managing cancellations and check-ins.
4. **`notificationService.ts`**: Bridges local hardware push reminders (via `expo-notifications`) with cloud-persisted notification history in `public.notifications`.
5. **`storageService.ts`**: Manages unencrypted device-level caching with `AsyncStorage` for session tokens and rapid startup hydration.

### 3.4 Authoritative Booking Conflict Prevention

To guarantee race-free concurrency control across simultaneous booking attempts by multiple students, conflict prevention operates at two distinct layers:

#### Layer 1: Client-Side Immediate Feedback
Before calling the network, `bookingService.ts` evaluates the requested slot against existing bookings in state using the pure interval overlap algorithm:
$$\text{newStart} < \text{existingEnd} \quad \text{AND} \quad \text{newEnd} > \text{existingStart}$$
If a conflict is detected locally, user feedback is provided immediately without network overhead.

#### Layer 2: Authoritative Database Concurrency Control (PostgreSQL RPC)
The authoritative check executes atomically within PostgreSQL inside the `create_booking()` stored procedure defined in `supabase/migrations/001_initial_schema.sql`:

```sql
CREATE OR REPLACE FUNCTION public.create_booking(
  p_user_id uuid,
  p_room_id uuid,
  p_booking_date date,
  p_start_time time,
  p_end_time time,
  p_booking_code text
) RETURNS jsonb AS $$
DECLARE
  v_room public.rooms%ROWTYPE;
  v_conflicting_id uuid;
  v_conflicting_start time;
  v_conflicting_end time;
  v_new_booking public.bookings%ROWTYPE;
BEGIN
  -- 1. Validate room exists and is not under maintenance
  SELECT * INTO v_room FROM public.rooms WHERE id = p_room_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'ROOM_NOT_FOUND: Room with ID % does not exist', p_room_id;
  END IF;
  IF v_room.status = 'maintenance' THEN
    RAISE EXCEPTION 'ROOM_MAINTENANCE: Room % is currently closed for maintenance', v_room.name;
  END IF;

  -- 2. Validate chronological time window
  IF p_start_time >= p_end_time THEN
    RAISE EXCEPTION 'INVALID_TIME_RANGE: Start time must be before end time';
  END IF;

  -- 3. Row-level lock and conflict detection (ignoring cancelled bookings)
  SELECT b.id, b.start_time, b.end_time
  INTO v_conflicting_id, v_conflicting_start, v_conflicting_end
  FROM public.bookings b
  WHERE b.room_id = p_room_id
    AND b.booking_date = p_booking_date
    AND b.status != 'cancelled'
    AND p_start_time < b.end_time
    AND p_end_time > b.start_time
  LIMIT 1
  FOR UPDATE;

  -- 4. Reject overlapping reservations
  IF FOUND THEN
    RAISE EXCEPTION 'BOOKING_CONFLICT: Room is already reserved from % to % on %',
      to_char(v_conflicting_start, 'HH24:MI'),
      to_char(v_conflicting_end, 'HH24:MI'),
      p_booking_date;
  END IF;

  -- 5. Atomic insertion
  INSERT INTO public.bookings (
    user_id, room_id, booking_date, start_time, end_time, status, booking_code, created_at
  ) VALUES (
    p_user_id, p_room_id, p_booking_date, p_start_time, p_end_time, 'confirmed', p_booking_code, now()
  ) RETURNING * INTO v_new_booking;

  RETURN to_jsonb(v_new_booking);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

By employing `FOR UPDATE`, PostgreSQL serializes overlapping transactions targeting the same room and date, preventing duplicate reservations even under high concurrency.

### 3.5 Performance Optimization

The rendering pipeline is designed to support smooth list rendering and reduce unnecessary re-renders:

1. **`FlatList` Virtualization**: Deployed in `DiscoverScreen.tsx` and `ReservationsScreen.tsx` with explicit `keyExtractor` to recycle view cells and maintain a stable memory footprint.
2. **`React.memo` Component Memoization**: Wraps `RoomCard.tsx` to prevent re-rendering unchanged cards during list updates or filter queries.
3. **`useCallback` Handlers**: Stabilizes function references passed as props to child components (`handleRoomPress`, `handleSelectSlot`, `handleCancelBooking`).
4. **`useMemo` Selectors**: Memoizes derived calculations, including the upcoming 7-day strip calculation (`getNext7Days()`) and occupancy percentages.
5. **Targeted Zustand Selectors**: Components subscribe only to specific atomic state properties (e.g. `useBookingStore(s => s.user)`), avoiding re-rendering when unrelated state slices mutate.

### 3.6 Database Security & Row Level Security (RLS)

All four database tables enforce strict Row Level Security policies:

- **`public.profiles`**: Students can read and update only their own profile (`auth.uid() = id`), while authenticated peers can view profile names for reservation displays.
- **`public.rooms`**: Publicly readable by authenticated students and visitors; modifications (`INSERT`, `UPDATE`, `DELETE`) are strictly restricted to users with the `admin` role.
- **`public.bookings`**: Authenticated students can query campus reservations to determine slot availability. Students can insert and update (`check_in`, `cancel`) reservations only where `auth.uid() = user_id`.
- **`public.notifications`**: Read, insert, and update operations are strictly restricted to the owning student (`auth.uid() = user_id`).
- **Secret Protection**: The high-privilege `service_role` key is never exposed in client code, environment bundles, or public repositories. The client operates exclusively through the publishable `anon` key under RLS enforcement.

---

## 4. EMPIRICAL EVIDENCE & SCREENSHOTS

### Screenshot 1 — Home Screen
![Home Screen](screenshots/01-home.png)
*Description:* Dashboard displaying student greeting, active upcoming reservation with room details, fast-action status badge, and real-time room availability overview.

---

### Screenshot 2 — Discover / Search / Filter
![Discover Screen](screenshots/02-discover.png)
*Description:* Room discovery interface powered by virtualized `FlatList`, interactive text search, and the multi-facet filter modal (filtering by building, capacity, and lab equipment).

---

### Screenshot 3 — Room Detail / Date / Time Slot
![Room Detail Screen](screenshots/03-room-detail.png)
*Description:* Classroom/lab detail screen presenting specifications, the dynamic 7-day horizontal date selector, and discrete 2-hour time slot cards highlighting available vs. reserved blocks.

---

### Screenshot 4 — Booking Pass / QR Check-In
![Booking Pass Screen](screenshots/04-booking-pass.png)
*Description:* Booking confirmation pass showing the unique reservation code (`VKU-YYYY-XXXXXX`), reservation validity time window, and the modal scannable SVG QR check-in pass.

---

### Recommended Demo Flow

To verify all system features on the live deployment:

1. **Launch Live Web App**: Open [https://vku-space-hub.vercel.app](https://vku-space-hub.vercel.app) in any browser.
2. **Authenticate**: On the sign-in screen, use the configured demo sign-in account or the Demo Student Sign-In button.
3. **Browse Rooms**: View the room catalog loaded live from the Supabase `rooms` table.
4. **Search & Filter**: Type `"V203"` in the search bar, or open the filter modal to filter by `"Building V"` and `"High-spec PC"`.
5. **Select Date & Slot**: Open a room detail screen (e.g. *V203 – Innovation Discussion Studio*), select a date from the dynamic 7-day strip, and choose an available 2-hour time slot.
6. **Confirm Booking**: Tap *"Continue to Booking"*, verify the details on `BookingConfirmationScreen`, and click *"Confirm Reservation"*. The app invokes the PostgreSQL `create_booking()` RPC.
7. **Inspect Booking Pass**: View the generated academic pass on `BookingSuccessScreen`.
8. **View QR Check-In**: Open the scannable SVG QR check-in pass displaying the encoded verification payload.
9. **Verify Conflict Prevention**: Return to the same room on the same date. Observe that the reserved time slot is now marked as unavailable and cannot be re-booked.
10. **Cancel Reservation**: Navigate to the **Bookings** tab, select the reservation under *Upcoming*, and tap *"Cancel Booking"*. Supabase updates the booking status to `cancelled`.
11. **Verify Slot Release**: Return to the room detail screen and verify that the previously cancelled time slot is immediately available for new reservations.

---

## 5. TECHNICAL CHALLENGES & RESOLUTIONS

### Challenge 1: Preventing Overlapping Room Reservations Across Distributed Clients

- **Problem:** When multiple students attempt to book overlapping intervals concurrently, client-side validation alone suffers from race conditions. Naive interval checks (`start === existingStart`) also fail to detect partial overlaps or nested time ranges.
- **Resolution:** Implemented a two-tier verification architecture. Client-side checks use the pure interval mathematical condition:
  $$\text{newStart} < \text{existingEnd} \quad \text{AND} \quad \text{newEnd} > \text{existingStart}$$
  Server-side verification is enforced authoritatively via PostgreSQL stored procedure `create_booking()`. By executing a `FOR UPDATE` query on conflicting intervals before inserting, the database serializes concurrent transactions and rejects overlapping bookings with a descriptive error.

### Challenge 2: Migrating from Local Mock Persistence to Real Cloud Database (Supabase)

- **Problem:** Transitioning from local mock data and `AsyncStorage` to Supabase required replacing mock models without breaking the existing UI, introducing database migrations, mapping PostgreSQL `snake_case` columns to TypeScript `camelCase` domain models, and handling schema idempotency during re-runs.
- **Resolution:**
  1. Created explicit database migration scripts (`supabase/migrations/001_initial_schema.sql`) and seed data (`supabase/seed.sql`).
  2. Guarded all policy creation statements with `DROP POLICY IF EXISTS` and wrapped publication alterations in conditional blocks to ensure complete idempotency.
  3. Built bidirectional domain mappers in `roomService.ts` and `bookingService.ts` that convert database records into existing TypeScript `Room` and `Booking` models without altering any UI components.

### Challenge 3: Cross-Platform Deployment & Web Browser Refreshes (Vercel)

- **Problem:** Compiling React Native to a Single Page Application (SPA) on Vercel created two issues: native push notification APIs throw unhandled exceptions in browser environments, and deep client-side navigation routes return HTTP 404 when refreshed because the static host attempts to find physical files.
- **Resolution:**
  1. Configured `vercel.json` with SPA route rewrites (`"source": "/(.*)", "destination": "/index.html"`), ensuring browser reloads always serve the compiled entry point.
  2. Encapsulated `expo-notifications` within platform-aware guards (`Platform.OS !== 'web'`) in `notificationService.ts`, allowing web users to complete bookings smoothly while preserving mobile notifications.
  3. Configured production environment variables (`EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) directly in the Vercel dashboard.

### Challenge 4: Separating Device Hardware Push from Cloud Notification Metadata

- **Problem:** Push notifications on mobile devices are ephemeral hardware alerts, whereas students expect a persistent in-app notification center that tracks unread status and booking confirmation receipts across devices.
- **Resolution:** Architected a decoupled notification system. `expo-notifications` handles local device scheduling 15 minutes prior to session start, while the Supabase `public.notifications` table authoritatively stores notification records, booking relationships, and read flags (`is_read`).

---

## 6. VERIFICATION RESULTS

All automated test suites, static analysis checks, and deployment bundles were verified:

| Verification Tool | Command | Result | Verification Status |
|---|---|:---:|:---:|
| **Test Suite** | `npm test` | **38 / 38 passed** | ✅ Verified (0 failures) |
| **TypeScript Compiler** | `npx tsc --noEmit` | **0 errors** | ✅ Verified clean compilation |
| **Expo Doctor** | `npx expo-doctor` | **21 / 21 checks passed** | ✅ Verified config & dependencies |
| **Expo Web Export** | `npx expo export --platform web` | **Exported to `dist/`** | ✅ Verified production bundle |
| **Supabase Cloud Schema** | SQL Editor Migration | Schema provisioned | ✅ Verified tables, RLS, & RPC |
| **Vercel Production Deployment** | CI/CD Pipeline | Live production site | ✅ Verified [vku-space-hub.vercel.app](https://vku-space-hub.vercel.app) |

### Detailed Test Suite Output (`npm test`)

```text
====================================================
🧪 VKU SPACEHUB - BACKEND & CORE TEST SUITE
====================================================

--- 1. Testing Conflict Engine hasBookingConflict() ---
  ✅ PASS: Overlapping interval (15:00-17:00 vs 14:00-16:00) detects conflict
  ✅ PASS: Back-to-back adjacent edge (16:00-18:00 vs 14:00-16:00) has NO conflict
  ✅ PASS: Identical timeframe (14:00-16:00 vs 14:00-16:00) detects conflict
  ✅ PASS: Discrete slots (07:30-09:30 vs 09:30-11:30) have NO conflict
  ✅ PASS: Sub-interval enclosed inside slot (10:00-11:00 vs 09:30-11:30) detects conflict
  ✅ PASS: Slot engulfing another slot (08:00-13:00 vs 09:30-11:30) detects conflict
  ✅ PASS: Active booking on Room V203 at 13:00-15:00 triggers conflict
  ✅ PASS: Cancelled booking on Room V203 at 07:30-09:30 does NOT block new reservation
  ✅ PASS: Excluding current booking id avoids self-conflict during updates

--- 2. Testing Booking Validation & Calculations ---
  ✅ PASS: 07:30 to 09:30 equals 120 minutes (2 hours)
  ✅ PASS: 09:30 to 11:30 equals 120 minutes (2 hours)
  ✅ PASS: 13:00 to 15:00 equals 120 minutes (2 hours)
  ✅ PASS: 15:00 to 17:00 equals 120 minutes (2 hours)
  ✅ PASS: Institutional email student@vku.edu.vn is valid
  ✅ PASS: Institutional email admin@vku.udn.vn with vku is valid
  ✅ PASS: Non-VKU email random@gmail.com is rejected
  ✅ PASS: Disallows inverted time window (15:00 to 13:00)
  ✅ PASS: Disallows reservations on maintenance rooms

--- 3. Testing Filter & Search Logic ---
  ✅ PASS: Search for "v203" accurately returns Room V203
  ✅ PASS: Building "A" filter accurately returns Building A rooms
  ✅ PASS: Capacity >= 10 accurately returns 2 rooms
  ✅ PASS: Equipment "High-spec PC" filter returns V103 Lab

--- 4. Testing Booking Status Lifecycle Transitions ---
  ✅ PASS: Transition: confirmed -> checked_in sets checkedInAt
  ✅ PASS: Transition: checked_in -> completed succeeds
  ✅ PASS: Transition: confirmed -> cancelled succeeds
  ✅ PASS: Disallows check-in from cancelled status
  ✅ PASS: Disallows cancellation from completed status

--- 5. Testing Supabase Data Mapping ---
  ✅ PASS: Room ID mapped accurately
  ✅ PASS: photo_url mapped to photo property
  ✅ PASS: room_type mapped to type property
  ✅ PASS: Database status "available" mapped to UI status "Available Now"
  ✅ PASS: Room at max capacity automatically receives "Occupied" status
  ✅ PASS: Booking code mapped accurately
  ✅ PASS: start_time trimmed from 13:00:00 to 13:00
  ✅ PASS: end_time trimmed from 15:00:00 to 15:00
  ✅ PASS: Duration computed as 120 minutes
  ✅ PASS: Room name retrieved from joined relation
  ✅ PASS: QR payload constructed according to standard

====================================================
TOTAL TESTS: 38 | PASSED: 38 | FAILED: 0
🏆 ALL ACADEMIC TESTS PASSED WITH 100% SUCCESS RATE!
====================================================
```

---

## 7. DELIVERABLE INFORMATION

- **GitHub Repository:** [https://github.com/HuuThai127/vku-space-hub](https://github.com/HuuThai127/vku-space-hub)
- **Live Demo URL:** [https://vku-space-hub.vercel.app](https://vku-space-hub.vercel.app)
- **Video Demo:** [https://drive.google.com/file/d/14KIY_okh8UHoNO_pgYAlJpz4p1nZ6r3c/view?usp=sharing](https://drive.google.com/file/d/14KIY_okh8UHoNO_pgYAlJpz4p1nZ6r3c/view?usp=sharing)

---

## 8. CONCLUSION

The **VKU SpaceHub** project successfully demonstrates the full technical scope expected of an advanced cross-platform mobile and web application:

1. **Cross-Platform Engineering**: Built on React Native and Expo SDK 57, delivering a single unified codebase that compiles to native iOS/Android viewports and a live, responsive production web application deployed on Vercel.
2. **Cloud Database Architecture**: Fully integrated with Supabase, leveraging PostgreSQL relational tables, Row-Level Security (RLS) data isolation, and Supabase Realtime subscriptions for room and booking synchronization.
3. **Robust State & Concurrency Management**: Combines lightweight global state via Zustand with an authoritative PostgreSQL `create_booking()` RPC function that serializes overlapping transactions with `FOR UPDATE` row locks, preventing double bookings.
4. **Optimized Interface Performance**: Leverages virtualized `FlatList` components, `React.memo` view memoization, and targeted atomic Zustand selectors to maintain smooth rendering across complex room catalogs.
5. **Practical Academic Features**: Implements scannable SVG QR check-in passes, dual-layer notification architecture (hardware push alerts and persistent cloud inbox records), and graceful web fallbacks.
6. **Empirical Quality Verification**: Backed by a verified 38-case automated test suite (100% pass rate), strict TypeScript type safety (0 compiler errors), clean Expo Doctor diagnostic evaluation (21/21 checks passed), and a verified live Vercel production deployment.
