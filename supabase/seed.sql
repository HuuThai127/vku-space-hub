  -- ==============================================================================
  -- VKU SpaceHub - Seed Data
  -- supabase/seed.sql
  -- Idempotent / Safe to run multiple times without duplicate errors
  -- ==============================================================================

  -- ------------------------------------------------------------------------------
  -- 1. DEMO USERS (Supabase Auth & Profiles)
  -- Safely inserts only if user ID and email do not already exist
  -- ------------------------------------------------------------------------------
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  SELECT
    v.id,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated',
    'authenticated',
    v.email,
    crypt(v.pass, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    json_build_object('full_name', v.name, 'role', 'student')::jsonb,
    now(),
    now()
  FROM (
    VALUES
    ('00000000-0000-0000-0000-000000000001'::uuid, 'student@vku.edu.vn', 'student123', 'Nguyen Van Student'),
    ('00000000-0000-0000-0000-000000000999'::uuid, 'academic@vku.edu.vn', 'academic123', 'Le Thi Academic'),
    ('00000000-0000-0000-0000-000000000102'::uuid, 'tritm@vku.edu.vn', 'student123', 'Tran Minh Tri'),
    ('00000000-0000-0000-0000-000000000103'::uuid, 'baohg@vku.edu.vn', 'student123', 'Hoang Gia Bao'),
    ('00000000-0000-0000-0000-000000000104'::uuid, 'huongpt@vku.edu.vn', 'student123', 'Pham Thu Huong'),
    ('00000000-0000-0000-0000-000000000105'::uuid, 'haudv@vku.edu.vn', 'student123', 'Doan Van Hau'),
    ('00000000-0000-0000-0000-000000000106'::uuid, 'anhnn@vku.edu.vn', 'student123', 'Nguyen Ngoc Anh')
  ) AS v(id, email, pass, name)
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = v.id OR u.email = v.email
  );

  -- Ensure corresponding profiles exist in public.profiles linked to real auth user IDs
  INSERT INTO public.profiles (id, full_name, email, role)
  SELECT
    u.id,
    v.name,
    u.email,
    'student'
  FROM (
    VALUES
    ('student@vku.edu.vn', 'Nguyen Van Student'),
    ('academic@vku.edu.vn', 'Le Thi Academic'),
    ('tritm@vku.edu.vn', 'Tran Minh Tri'),
    ('baohg@vku.edu.vn', 'Hoang Gia Bao'),
    ('huongpt@vku.edu.vn', 'Pham Thu Huong'),
    ('haudv@vku.edu.vn', 'Doan Van Hau'),
    ('anhnn@vku.edu.vn', 'Nguyen Ngoc Anh')
  ) AS v(email, name)
  JOIN auth.users u ON u.email = v.email
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role;

  -- ------------------------------------------------------------------------------
  -- 2. SEED ROOMS (12 realistic VKU study rooms & computer labs)
  -- Idempotent: ON CONFLICT (code) updates existing rooms in place
  -- ------------------------------------------------------------------------------
  INSERT INTO public.rooms (
    id,
    code,
    name,
    building,
    floor,
    room_type,
    capacity,
    equipment,
    photo_url,
    current_occupancy,
    status,
    description
  ) VALUES
  -- Building A
  (
    'a1010000-0000-0000-0000-000000000101',
    'A101',
    'A101 - Smart Study Haven',
    'A',
    1,
    'Study Room',
    6,
    ARRAY['Whiteboard', 'AC'],
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    2,
    'available',
    'A cozy natural light study room ideal for small peer groups and focused revision.'
  ),
  (
    'a2030000-0000-0000-0000-000000000203',
    'A203',
    'A203 - Collaborative Seminar',
    'A',
    2,
    'Discussion Room',
    12,
    ARRAY['Projector', 'Whiteboard', 'AC'],
    'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80',
    8,
    'occupied',
    'Equipped with dual whiteboards and high-lumen projection for team ideation and presentation.'
  ),
  (
    'a3050000-0000-0000-0000-000000000305',
    'A305',
    'A305 - Quiet Research Lounge',
    'A',
    3,
    'Study Room',
    4,
    ARRAY['Whiteboard', 'AC'],
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
    0,
    'available',
    'A soundproof quiet space dedicated to individual thesis work and deep reading.'
  ),

  -- Building B
  (
    'b1020000-0000-0000-0000-000000000102',
    'B102',
    'B102 - Creative Discussion Lab',
    'B',
    1,
    'Discussion Room',
    10,
    ARRAY['Projector', 'Whiteboard', 'AC'],
    'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800&q=80',
    0,
    'available',
    'Modular furniture layout supporting round-table debates and capstone project meetings.'
  ),
  (
    'b2040000-0000-0000-0000-000000000204',
    'B204',
    'B204 - Hardware & IoT Lab',
    'B',
    2,
    'Computer Lab',
    16,
    ARRAY['High-spec PC', 'Projector', 'AC'],
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    14,
    'occupied',
    'High performance testing benches for embedded systems and robotics student workshops.'
  ),
  (
    'b3050000-0000-0000-0000-000000000305',
    'B305',
    'B305 - Network Architecture Lab',
    'B',
    3,
    'Computer Lab',
    18,
    ARRAY['High-spec PC', 'Projector', 'AC'],
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    0,
    'maintenance',
    'Undergoing Cisco switch firmware upgrades and network rack re-cabling.'
  ),

  -- Building C
  (
    'c2010000-0000-0000-0000-000000000201',
    'C201',
    'C201 - Executive Brainstorming',
    'C',
    2,
    'Discussion Room',
    8,
    ARRAY['Whiteboard', 'Projector', 'AC'],
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
    3,
    'available',
    'Premium conference table with ergonomic chairs and full AV teleconference gear.'
  ),
  (
    'c3020000-0000-0000-0000-000000000302',
    'C302',
    'C302 - Software Engineering Hub',
    'C',
    3,
    'Computer Lab',
    20,
    ARRAY['High-spec PC', 'Projector', 'Whiteboard', 'AC'],
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    18,
    'occupied',
    'Dual-monitor workstations configured for cloud development and full-stack hackathons.'
  ),
  (
    'c4050000-0000-0000-0000-000000000405',
    'C405',
    'C405 - Quiet Thesis Studio',
    'C',
    4,
    'Study Room',
    6,
    ARRAY['Whiteboard', 'AC'],
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    0,
    'available',
    'High floor tranquil workspace with panoramic campus views, perfect for finals prep.'
  ),

  -- Building V (VKU Tech Innovation Center)
  (
    '00000103-0000-0000-0000-000000000103',
    'V103',
    'V103 - AI & Data Analytics Lab',
    'V',
    1,
    'Computer Lab',
    20,
    ARRAY['High-spec PC', 'Projector', 'Whiteboard', 'AC'],
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    6,
    'available',
    'State-of-the-art RTX-accelerated GPU workstations configured for Deep Learning training.'
  ),
  (
    '00000203-0000-0000-0000-000000000203',
    'V203',
    'V203 - Innovation Discussion Studio',
    'V',
    2,
    'Discussion Room',
    10,
    ARRAY['Projector', 'Whiteboard', 'AC'],
    'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    4,
    'available',
    'VKU innovation zone with touch interactive smart screen and writable glass partitions.'
  ),
  (
    '00000305-0000-0000-0000-000000000305',
    'V305',
    'V305 - VR / Game Dev Lab',
    'V',
    3,
    'Computer Lab',
    15,
    ARRAY['High-spec PC', 'Projector', 'AC'],
    'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?auto=format&fit=crop&w=800&q=80',
    0,
    'maintenance',
    'Undergoing sensor calibration and VR headset station firmware upgrades.'
  )
  ON CONFLICT (code) DO UPDATE
  SET
    name = EXCLUDED.name,
    building = EXCLUDED.building,
    floor = EXCLUDED.floor,
    room_type = EXCLUDED.room_type,
    capacity = EXCLUDED.capacity,
    equipment = EXCLUDED.equipment,
    photo_url = EXCLUDED.photo_url,
    status = EXCLUDED.status,
    description = EXCLUDED.description;

  -- ------------------------------------------------------------------------------
  -- 3. SEED BOOKINGS (12+ realistic campus bookings)
  -- Relational lookup by room code and student email with ON CONFLICT (booking_code)
  -- ------------------------------------------------------------------------------
  INSERT INTO public.bookings (
    booking_code,
    room_id,
    user_id,
    booking_date,
    start_time,
    end_time,
    status,
    created_at
  )
  SELECT
    b.booking_code,
    r.id AS room_id,
    p.id AS user_id,
    b.booking_date,
    b.start_time,
    b.end_time,
    b.status,
    b.created_at
  FROM (
    VALUES
    -- 1. CONFLICT DEMONSTRATION BOOKING: V203 reserved by Le Thi Academic on today 13:00-15:00
    ('VKU-2026-V203CF', 'V203', 'academic@vku.edu.vn', CURRENT_DATE, '13:00:00'::time, '15:00:00'::time, 'confirmed', now() - interval '1 day'),
    -- 2. Today reservation for Nguyen Van Student at A101
    ('VKU-2026-A101AB', 'A101', 'student@vku.edu.vn', CURRENT_DATE, '09:30:00'::time, '11:30:00'::time, 'confirmed', now() - interval '5 hours'),
    -- 3. Tomorrow reservation for Nguyen Van Student at V103
    ('VKU-2026-V103AI', 'V103', 'student@vku.edu.vn', CURRENT_DATE + interval '1 day', '07:30:00'::time, '09:30:00'::time, 'confirmed', now() - interval '12 hours'),
    -- 4. Active reservation on A203 by Tran Minh Tri
    ('VKU-2026-A203EX', 'A203', 'tritm@vku.edu.vn', CURRENT_DATE, '07:30:00'::time, '09:30:00'::time, 'confirmed', now() - interval '3 hours'),
    -- 5. Active reservation on B102 by Hoang Gia Bao
    ('VKU-2026-B102CD', 'B102', 'baohg@vku.edu.vn', CURRENT_DATE, '15:00:00'::time, '17:00:00'::time, 'confirmed', now() - interval '2 hours'),
    -- 6. Tomorrow reservation on C201 by Pham Thu Huong
    ('VKU-2026-C201EB', 'C201', 'huongpt@vku.edu.vn', CURRENT_DATE + interval '1 day', '09:30:00'::time, '11:30:00'::time, 'confirmed', now() - interval '1 hour'),
    -- 7. Tomorrow reservation on C302 by Doan Van Hau
    ('VKU-2026-C302SE', 'C302', 'haudv@vku.edu.vn', CURRENT_DATE + interval '1 day', '13:00:00'::time, '15:00:00'::time, 'confirmed', now() - interval '30 minutes'),
    -- 8. Day after tomorrow reservation on B204 by Nguyen Ngoc Anh
    ('VKU-2026-B204HW', 'B204', 'anhnn@vku.edu.vn', CURRENT_DATE + interval '2 days', '07:30:00'::time, '09:30:00'::time, 'confirmed', now()),
    -- 9. Completed booking history item with check-in timestamp
    ('VKU-2026-C405HS', 'C405', 'student@vku.edu.vn', CURRENT_DATE - interval '3 days', '13:00:00'::time, '15:00:00'::time, 'completed', now() - interval '4 days'),
    -- 10. Cancelled reservation (slot remains free for others)
    ('VKU-2026-A305CA', 'A305', 'student@vku.edu.vn', CURRENT_DATE - interval '1 day', '15:00:00'::time, '17:00:00'::time, 'cancelled', now() - interval '2 days'),
    -- 11. Checked-in active reservation
    ('VKU-2026-V203CK', 'V203', 'tritm@vku.edu.vn', CURRENT_DATE, '07:30:00'::time, '09:30:00'::time, 'checked_in', now() - interval '2 hours'),
    -- 12. Advance booking for next week
    ('VKU-2026-A101NX', 'A101', 'student@vku.edu.vn', CURRENT_DATE + interval '3 days', '13:00:00'::time, '15:00:00'::time, 'confirmed', now())
  ) AS b(booking_code, room_code, user_email, booking_date, start_time, end_time, status, created_at)
  JOIN public.rooms r ON r.code = b.room_code
  JOIN public.profiles p ON p.email = b.user_email
  ON CONFLICT (booking_code) DO NOTHING;

  -- Update checked-in timestamps for checked_in and completed bookings
  UPDATE public.bookings
  SET checked_in_at = created_at + interval '10 minutes'
  WHERE booking_code IN ('VKU-2026-C405HS', 'VKU-2026-V203CK')
    AND checked_in_at IS NULL;

  -- ------------------------------------------------------------------------------
  -- 4. SEED NOTIFICATIONS
  -- Relational lookup linked to existing bookings
  -- ------------------------------------------------------------------------------
  INSERT INTO public.notifications (
    id,
    user_id,
    booking_id,
    title,
    message,
    type,
    is_read,
    created_at
  )
  SELECT
    '00000000-0000-0000-0002-000000000001'::uuid,
    b.user_id,
    b.id,
    'Reservation Confirmed',
    'Your booking for A101 - Smart Study Haven has been confirmed.',
    'booking_created',
    false,
    now() - interval '2 hours'
  FROM public.bookings b
  WHERE b.booking_code = 'VKU-2026-A101AB'
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.notifications (
    id,
    user_id,
    booking_id,
    title,
    message,
    type,
    is_read,
    created_at
  )
  SELECT
    '00000000-0000-0000-0002-000000000002'::uuid,
    b.user_id,
    b.id,
    'Upcoming Session Reminder',
    'Your study room reservation starts in 15 minutes at A101.',
    'booking_reminder',
    false,
    now() - interval '1 hour'
  FROM public.bookings b
  WHERE b.booking_code = 'VKU-2026-A101AB'
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.notifications (
    id,
    user_id,
    booking_id,
    title,
    message,
    type,
    is_read,
    created_at
  )
  SELECT
    '00000000-0000-0000-0002-000000000003'::uuid,
    b.user_id,
    b.id,
    'Check-in Verified',
    'You successfully checked in at C405 - Quiet Thesis Studio.',
    'check_in_success',
    true,
    now() - interval '3 days'
  FROM public.bookings b
  WHERE b.booking_code = 'VKU-2026-C405HS'
  ON CONFLICT (id) DO NOTHING;
