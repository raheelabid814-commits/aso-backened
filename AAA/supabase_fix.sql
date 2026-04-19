-- ============================================================
-- CH Restaurant & Bakery - COMPLETE SUPABASE FIX
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================================

-- ====== ORDERS TABLE ======
-- Drop ALL old conflicting policies
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Cashier can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Cashier can update orders" ON public.orders;
DROP POLICY IF EXISTS "Allow user to insert own order" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated to view all orders" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated to update orders" ON public.orders;

-- Make sure RLS is enabled
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy 1: Any authenticated user can INSERT their own order
CREATE POLICY "Allow user to insert own order"
ON public.orders FOR INSERT TO authenticated
WITH CHECK (auth.jwt() ->> 'email' = "user");

-- Policy 2: Any authenticated user can SELECT ALL orders
-- (Customer app filters by email in JS code, cashier sees all)
CREATE POLICY "Allow authenticated to view all orders"
ON public.orders FOR SELECT TO authenticated
USING (true);

-- Policy 3: Any authenticated user can UPDATE order status
-- (Cashier uses this to mark orders as Prepared / Completed)
CREATE POLICY "Allow authenticated to update orders"
ON public.orders FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);


-- ====== NOTIFICATIONS TABLE ======
DROP POLICY IF EXISTS "Users can manage their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow user to read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow anyone authenticated to insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow user to update own notifications" ON public.notifications;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users see only their own notifications
CREATE POLICY "Allow user to read own notifications"
ON public.notifications FOR SELECT TO authenticated
USING (auth.jwt() ->> 'email' = user_email);

-- Any server/authenticated call can insert a notification for any user
CREATE POLICY "Allow authenticated to insert notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (true);

-- Users can mark their own notifications as read
CREATE POLICY "Allow user to update own notifications"
ON public.notifications FOR UPDATE TO authenticated
USING (auth.jwt() ->> 'email' = user_email);


-- ====== FAVOURITES TABLE ======
DROP POLICY IF EXISTS "Users can manage their own favourites" ON public.favourites;
ALTER TABLE public.favourites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own favourites"
ON public.favourites FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = user_email)
WITH CHECK (auth.jwt() ->> 'email' = user_email);


-- ====== APP SETTINGS TABLE ======
DROP POLICY IF EXISTS "Anyone can read settings" ON public.app_settings;
DROP POLICY IF EXISTS "Cashier can update settings" ON public.app_settings;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings"
ON public.app_settings FOR SELECT
USING (true);

CREATE POLICY "Authenticated can update settings"
ON public.app_settings FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

INSERT INTO public.app_settings (setting_key, setting_value)
VALUES ('price_overrides', '{}')
ON CONFLICT (setting_key) DO NOTHING;


-- ====== LEGAL CONTENT TABLE ======
DROP POLICY IF EXISTS "Anyone can read legal content" ON public.legal_content;
ALTER TABLE public.legal_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read legal content"
ON public.legal_content FOR SELECT
USING (true);

INSERT INTO public.legal_content (id, title, content)
VALUES ('privacy-policy', 'Privacy Policy',
'We collect your email for OTP verification and your address for delivery. We do not sell your data. Your information is used solely to process orders and improve our service. We use Supabase enterprise-grade security to protect your data.')
ON CONFLICT (id) DO NOTHING;


-- ====== VERIFY: Check all policies ======
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
