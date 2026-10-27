# Supabase Setup Guide for সদকায়ে জারিয়া মাসিক ফান্ড (Sadqah Jariyah Monthly Fund)

This directory contains the database schema, seed data, and Row Level Security (RLS) policies for the application.

## Files
- `schema.sql`: Contains the complete database structure (`profiles`, `contributions`, `expenses`, `audit_logs`), functions (`is_admin()`, `get_fund_summary()`), triggers, and RLS policies.
- `seed.sql`: Contains the initial 25 member profiles (1 Admin, 4 Committee Members, 20 General Members) with `monthly_contribution = 0.00`.

---

## Step-by-Step Setup in Supabase Dashboard

### 1. Create a Supabase Project
1. Log in to [https://supabase.com](https://supabase.com) and click **"New Project"**.
2. Give your project a name: `Sadqah Jariyah Fund`.
3. Set a strong database password and select the region closest to your users (e.g. Singapore `ap-southeast-1` or Mumbai `ap-south-1`).

### 2. Execute SQL Schema & Seed Data
1. In the Supabase Dashboard, navigate to the **SQL Editor** tab on the left sidebar.
2. Click **"New query"**.
3. Copy the full contents of [`schema.sql`](./schema.sql) and paste into the editor.
4. Click **"Run"** to execute the script. This creates all tables, indexes, triggers, and Row Level Security (RLS) policies.
5. Create another new query, copy the contents of [`seed.sql`](./seed.sql), and click **"Run"**.
   - This registers the 25 member profiles with their correct roles and status.

### 3. Create the Admin Auth User
1. In the Supabase Dashboard, navigate to **Authentication** -> **Users**.
2. Click **"Add User"** -> **"Create user"**.
3. Enter:
   - Email: `admin@sadqahfund.org` (or Md Samiul Islam's designated email address)
   - Password: A strong password
   - Auto Confirm User: **Checked** (Enabled)
4. Click **"Create user"**.
5. Once created, copy the user's `UID` (UUID).
6. In SQL Editor, link this Auth UID to the profile row:
   ```sql
   UPDATE profiles 
   SET auth_user_id = '<COPIED_AUTH_USER_UUID>'
   WHERE email = 'admin@sadqahfund.org';
   ```

### 4. Create Member Auth Users (When ready)
Repeat the same step for members when onboarding them, or members can sign in with the default credentials managed via the Admin Dashboard.

### 5. Obtain API Keys
1. Go to **Project Settings** -> **API**.
2. Copy:
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **Project API Keys** -> `anon` / `public` (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **Project API Keys** -> `service_role` / `secret` (`SUPABASE_SERVICE_ROLE_KEY`)
3. Place these into your `.env.local` or Vercel Environment Variables.
