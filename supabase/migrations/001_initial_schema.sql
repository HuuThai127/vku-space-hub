-- ==============================================================================
-- VKU SpaceHub - Initial Supabase Database Schema
-- Migration: 001_initial_schema.sql
-- Idempotent / Safe to run on empty, partially-initialized, or existing databases
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. PROFILES TABLE
-- Linked to Supabase Auth users (auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase auth.users for VKU students and staff';

-- ==============================================================================
-- 2. ROOMS TABLE
-- Campus rooms and laboratories across Buildings A, B, C, and V
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  building text NOT NULL,
  floor integer,
  room_type text NOT NULL,
  capacity integer NOT NULL CHECK (capacity > 0),
  equipment text[] NOT NULL DEFAULT '{}',
  photo_url text,
  current_occupancy integer NOT NULL DEFAULT 0 CHECK (current_occupancy >= 0),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.rooms IS 'Physical study rooms and computer labs available for reservation';

-- ==============================================================================
-- 3. BOOKINGS TABLE
-- Room reservation records with discrete time slots and check-in lifecycle
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  booking_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'checked_in', 'completed', 'cancelled', 'no_show')),
  booking_code text UNIQUE NOT NULL,
  checked_in_at timestamptz,
  notification_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_time_window CHECK (start_time < end_time)
);

COMMENT ON TABLE public.bookings IS 'Authoritative campus reservations and QR check-in records';

-- ==============================================================================
-- 4. NOTIFICATIONS TABLE
-- Notification metadata and read tracking
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.notifications IS 'Notification history and read status for students';

-- ==============================================================================
-- 5. PERFORMANCE INDEXES (Idempotent with IF NOT EXISTS)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_rooms_code ON public.rooms (code);
CREATE INDEX IF NOT EXISTS idx_rooms_building ON public.rooms (building);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms (status);

CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON public.bookings (room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON public.bookings (booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_conflict_lookup ON public.bookings (room_id, booking_date, status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- Safe idempotent approach: DROP POLICY IF EXISTS followed by CREATE POLICY
-- ==============================================================================

-- Enable RLS on all tables (idempotent in Postgres)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Authenticated users can view basic profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view basic profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- ROOMS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can read rooms" ON public.rooms;
CREATE POLICY "Authenticated users can read rooms"
  ON public.rooms
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Anon users can view rooms" ON public.rooms;
CREATE POLICY "Anon users can view rooms"
  ON public.rooms
  FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Admins can insert rooms" ON public.rooms;
CREATE POLICY "Admins can insert rooms"
  ON public.rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update rooms" ON public.rooms;
CREATE POLICY "Admins can update rooms"
  ON public.rooms
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete rooms" ON public.rooms;
CREATE POLICY "Admins can delete rooms"
  ON public.rooms
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ------------------------------------------------------------------------------
-- BOOKINGS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can read bookings" ON public.bookings;
CREATE POLICY "Authenticated users can read bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can create bookings for themselves" ON public.bookings;
CREATE POLICY "Users can create bookings for themselves"
  ON public.bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
CREATE POLICY "Users can update their own bookings"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- NOTIFICATIONS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
CREATE POLICY "Users can read own notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
CREATE POLICY "Users can insert own notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- 7. ATOMIC BOOKING CONFLICT PREVENTION RPC
-- create_booking() (Idempotent with CREATE OR REPLACE FUNCTION)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.create_booking(
  p_user_id uuid,
  p_room_id uuid,
  p_booking_date date,
  p_start_time time,
  p_end_time time,
  p_booking_code text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room public.rooms%ROWTYPE;
  v_conflicting_id uuid;
  v_conflicting_start time;
  v_conflicting_end time;
  v_duration_minutes integer;
  v_new_booking public.bookings%ROWTYPE;
BEGIN
  -- 1. Validate the room exists
  SELECT * INTO v_room FROM public.rooms WHERE id = p_room_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'ROOM_NOT_FOUND: Room with ID % does not exist', p_room_id;
  END IF;

  -- Validate room is not in maintenance
  IF v_room.status = 'maintenance' THEN
    RAISE EXCEPTION 'ROOM_MAINTENANCE: Room % is currently closed for maintenance', v_room.name;
  END IF;

  -- 2. Validate time range
  IF p_start_time >= p_end_time THEN
    RAISE EXCEPTION 'INVALID_TIME_RANGE: Start time (%) must be strictly before end time (%)', p_start_time, p_end_time;
  END IF;

  -- 3. Validate duration
  v_duration_minutes := EXTRACT(EPOCH FROM (p_end_time - p_start_time)) / 60;
  IF v_duration_minutes <= 0 THEN
    RAISE EXCEPTION 'INVALID_DURATION: Duration must be greater than zero minutes';
  END IF;

  -- 4 & 5. Detect overlapping bookings for the same room & date
  -- Interval rule: newStart < existingEnd AND newEnd > existingStart
  -- Ignore cancelled bookings
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

  -- 6. Reject conflicts
  IF FOUND THEN
    RAISE EXCEPTION 'BOOKING_CONFLICT: Room is already reserved from % to % on %',
      to_char(v_conflicting_start, 'HH24:MI'),
      to_char(v_conflicting_end, 'HH24:MI'),
      p_booking_date;
  END IF;

  -- 7. Insert the booking atomically
  INSERT INTO public.bookings (
    user_id,
    room_id,
    booking_date,
    start_time,
    end_time,
    status,
    booking_code,
    created_at
  ) VALUES (
    p_user_id,
    p_room_id,
    p_booking_date,
    p_start_time,
    p_end_time,
    'confirmed',
    p_booking_code,
    now()
  )
  RETURNING * INTO v_new_booking;

  -- Return the created booking as JSONB
  RETURN to_jsonb(v_new_booking);
END;
$$;

COMMENT ON FUNCTION public.create_booking IS 'Authoritative database RPC with atomic lock and interval conflict detection';

-- ==============================================================================
-- 8. AUTH TRIGGER FOR AUTOMATIC PROFILE CREATION
-- Automatically creates a public.profiles entry whenever a user signs up
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;
  RETURN new;
END;
$$;

-- Safely recreate trigger (DROP TRIGGER IF EXISTS + CREATE TRIGGER)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 9. REALTIME PUBLICATION REGISTRATION
-- Idempotent check before adding tables to publication
-- ==============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'bookings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
  END IF;
END $$;
