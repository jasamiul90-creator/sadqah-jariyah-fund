-- ==============================================================================
-- Sadqah Jariyah Monthly Fund (সদকায়ে জারিয়া মাসিক ফান্ড)
-- Comprehensive Database Schema & Row Level Security (RLS)
-- ==============================================================================

-- 1. Create Custom Enum / Types (or Text with Check Constraints)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables/functions if re-running
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS contributions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS get_fund_summary() CASCADE;

-- 2. Create PROFILES Table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'committee', 'member')) DEFAULT 'member',
    monthly_contribution NUMERIC(12, 2) NOT NULL DEFAULT 0,
    member_status TEXT NOT NULL CHECK (member_status IN ('active', 'inactive')) DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for fast lookup by auth_user_id and email
CREATE INDEX idx_profiles_auth_user_id ON profiles(auth_user_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- 3. Create CONTRIBUTIONS Table
CREATE TABLE contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    contribution_month INT NOT NULL CHECK (contribution_month BETWEEN 1 AND 12),
    contribution_year INT NOT NULL CHECK (contribution_year >= 2020),
    expected_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL DEFAULT 'bKash' CHECK (payment_method IN ('bKash', 'Nagad', 'Rocket', 'Bank Transfer', 'Cash', 'Other')),
    transaction_reference TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for performance
CREATE INDEX idx_contributions_member_id ON contributions(member_id);
CREATE INDEX idx_contributions_month_year ON contributions(contribution_year, contribution_month);

-- 4. Create EXPENSES Table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'Charity', 
        'Medical Assistance', 
        'Food Assistance', 
        'Islamic Activities', 
        'Mosque or Madrasa', 
        'Other'
    )),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    receipt_url TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category);

-- 5. Create AUDIT_LOGS Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT,
    previous_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);

-- 6. Helper Function: is_admin()
-- Checks if currently authenticated user is an active Admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE auth_user_id = auth.uid() 
      AND role = 'admin' 
      AND member_status = 'active'
  );
$$;

-- 7. Helper RPC: get_fund_summary()
-- Secure aggregator for public/member overview without exposing individual amounts
CREATE OR REPLACE FUNCTION get_fund_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_total_members INT;
    v_total_collection NUMERIC(12, 2);
    v_total_expenses NUMERIC(12, 2);
    v_current_balance NUMERIC(12, 2);
    v_total_expected NUMERIC(12, 2);
    v_total_due NUMERIC(12, 2);
BEGIN
    SELECT COUNT(*) INTO v_total_members FROM profiles WHERE member_status = 'active';
    SELECT COALESCE(SUM(paid_amount), 0) INTO v_total_collection FROM contributions;
    SELECT COALESCE(SUM(expected_amount), 0) INTO v_total_expected FROM contributions;
    SELECT COALESCE(SUM(amount), 0) INTO v_total_expenses FROM expenses;
    
    -- Calculate total due: sum where paid < expected
    SELECT COALESCE(SUM(GREATEST(0, expected_amount - paid_amount)), 0) 
    INTO v_total_due 
    FROM contributions;
    
    v_current_balance := v_total_collection - v_total_expenses;

    RETURN jsonb_build_object(
        'total_members', v_total_members,
        'total_collection', v_total_collection,
        'total_expenses', v_total_expenses,
        'current_balance', v_current_balance,
        'total_expected', v_total_expected,
        'total_due', v_total_due
    );
END;
$$;

-- 8. Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 8.1 PROFILES Policies
-- Admins can do everything
CREATE POLICY "Admins have full access to profiles"
ON profiles FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Authenticated users can view basic profile info (needed to see fellow member names in public fund summaries/directory)
CREATE POLICY "Authenticated users can view member profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Users can update their own phone or limited profile details (role/status can only be changed by admin due to CHECK/Admin check)
CREATE POLICY "Users can update their own non-sensitive profile info"
ON profiles FOR UPDATE
TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (
    auth_user_id = auth.uid() 
    AND role = (SELECT role FROM profiles WHERE auth_user_id = auth.uid())
    AND monthly_contribution = (SELECT monthly_contribution FROM profiles WHERE auth_user_id = auth.uid())
    AND member_status = (SELECT member_status FROM profiles WHERE auth_user_id = auth.uid())
);

-- 8.2 CONTRIBUTIONS Policies
-- Admins can view, insert, update, delete all contributions
CREATE POLICY "Admins have full access to contributions"
ON contributions FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Members can only view their own contributions!
CREATE POLICY "Members can view only their own contributions"
ON contributions FOR SELECT
TO authenticated
USING (
    member_id IN (
        SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    )
);

-- 8.3 EXPENSES Policies
-- All authenticated members can view expenses (for complete transparency of fund utilization)
CREATE POLICY "Authenticated users can view expenses"
ON expenses FOR SELECT
TO authenticated
USING (true);

-- Only Admin can insert, update, delete expenses
CREATE POLICY "Only Admin can insert expenses"
ON expenses FOR INSERT
TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "Only Admin can update expenses"
ON expenses FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Only Admin can delete expenses"
ON expenses FOR DELETE
TO authenticated
USING (is_admin());

-- 8.4 AUDIT_LOGS Policies
-- Only Admin can view audit logs
CREATE POLICY "Only Admin can view audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (is_admin());

-- System/Admin can insert audit logs
CREATE POLICY "Authenticated users can insert audit logs via server"
ON audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- 9. Trigger for Auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER trg_contributions_updated_at
BEFORE UPDATE ON contributions
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER trg_expenses_updated_at
BEFORE UPDATE ON expenses
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
