# Supabase Backend Setup Guide for VKU SpaceHub

This guide provides step-by-step instructions to configure a real cloud PostgreSQL and Auth backend on Supabase for VKU SpaceHub.

---

## 1. Create a Supabase Project

1. Navigate to [Supabase Dashboard](https://supabase.com/dashboard) and sign in (or create a free account).
2. Click **New project**.
3. Select your organization and enter:
   - **Name:** `vku-spacehub` (or your preferred name)
   - **Database Password:** Enter a strong password and save it securely.
   - **Region:** Select Southeast Asia (Singapore `ap-southeast-1`) for lowest latency to Vietnam.
4. Click **Create new project** and wait ~2 minutes for database provisioning to complete.

---

## 2. Open the SQL Editor

1. In your Supabase project dashboard, navigate to the left sidebar.
2. Click on the **SQL Editor** icon (terminal icon `>_`).
3. Click **New query** (or `+`).

---

## 3. Run Schema Migration

1. In your local repository, locate the schema migration file:
   [`supabase/migrations/001_initial_schema.sql`](file:///e:/Projects/VKU-SpaceHub/supabase/migrations/001_initial_schema.sql)
2. Copy the entire file contents and paste them into the Supabase SQL Editor.
3. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`).
4. Verify the output message says `Success. No rows returned`.
5. This migration provisions:
   - `public.profiles` table (linked to `auth.users`)
   - `public.rooms` table (with capacity, equipment, occupancy, status)
   - `public.bookings` table (with booking_code, time slots, check-in timestamps)
   - `public.notifications` table (metadata and read flags)
   - Performance indexes
   - Row-Level Security (RLS) policies
   - Authoritative `create_booking()` atomic conflict-prevention function (RPC)
   - `on_auth_user_created` trigger for automatic profile generation
   - Supabase Realtime publication for `rooms` and `bookings`

---

## 4. Run Seed Data

1. In the Supabase SQL Editor, open another **New query**.
2. Locate the seed script:
   [`supabase/seed.sql`](file:///e:/Projects/VKU-SpaceHub/supabase/seed.sql)
3. Copy the entire contents and paste them into the SQL Editor.
4. Click **Run**.
5. This will seed:
   - 7 student accounts in Supabase Auth & Profiles (including demo student `student@vku.edu.vn`)
   - 12 realistic VKU campus rooms across Buildings A, B, C, and V (A101, A203, A305, B102, B204, B305, C201, C302, C405, V103, V203, V305)
   - 12 campus bookings demonstrating discrete slots, historical check-ins, and the conflict scenario on Room V203 (13:00 to 15:00)
   - Initial notification history

---

## 5. Obtain Project URL

1. In the Supabase dashboard, click the **Settings** gear icon in the left sidebar.
2. Select **API** (or **Data API**).
3. Under **Project URL**, copy the URL. It will look like:
   `https://xyzcompany.supabase.co`

---

## 6. Obtain Publishable (anon) Key

1. On the same **API** settings page, look under **Project API keys**.
2. Copy the `anon` / `public` key.
   > **SECURITY WARNING:**
   > - Use ONLY the `anon` / `public` key for client applications.
   > - NEVER expose the `service_role` key in client code, `.env.local`, GitHub, or Vercel client environment variables.

---

## 7. Create `.env.local` Locally

In your local project root (`E:\Projects\VKU-SpaceHub`), create a file named `.env.local` (this file is excluded by `.gitignore` and will never be committed to Git):

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace the placeholder values with your real URL and publishable key from Steps 5 & 6.

---

## 8. Configure Vercel Environment Variables (For Web Deployment)

When you are ready to update the live Vercel web demo ([https://vku-space-hub.vercel.app](https://vku-space-hub.vercel.app)):

1. Open your [Vercel Dashboard](https://vercel.com/dashboard).
2. Select your project (`vku-space-hub`).
3. Go to **Settings** > **Environment Variables**.
4. Add the following two variables:
   - `EXPO_PUBLIC_SUPABASE_URL`: Value from Step 5.
   - `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Value from Step 6.
5. Apply them to **Production**, **Preview**, and **Development**.
6. Trigger a new deployment (or redeploy from the Vercel deployments tab).

---

## 9. Run and Verify the Expo App Locally

1. Start the Expo development server:
   ```bash
   npx expo start
   ```
2. Or run web locally:
   ```bash
   npx expo start --web
   ```
3. Run the automated test suite:
   ```bash
   npm test
   ```
4. Perform type-checking:
   ```bash
   npx tsc --noEmit
   ```
5. Check dependencies:
   ```bash
   npx expo-doctor
   ```

---

## 10. Verification Checklist

- [ ] Sign in with demo account (`student@vku.edu.vn` / `student123`) or register a new VKU student account.
- [ ] View rooms on the Discover screen (fetched directly from the `rooms` table).
- [ ] Attempt to book Room V203 today between 13:00 and 15:00 — observe that the authoritative `create_booking()` RPC rejects the duplicate reservation with a clear conflict message.
- [ ] Book an available slot on Room A101 — verify it creates a record in `bookings` and inserts a metadata notification in `notifications`.
- [ ] Cancel a reservation from the Reservations tab — verify the database updates `status = 'cancelled'`.
- [ ] Perform a check-in — verify `status = 'checked_in'` and `checked_in_at` timestamp updates.
