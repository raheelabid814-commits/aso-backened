-- ============================================================
-- CH Restaurant & Bakery - COMPLETE SUPABASE SCHEMA & POLIES
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================================

-- 1. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    "user" TEXT NOT NULL,
    type TEXT NOT NULL,          -- 'delivery' or 'pickup'
    address TEXT,
    items JSONB NOT NULL,
    total NUMERIC NOT NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'Pending',
    store TEXT NOT NULL DEFAULT 'fast-food'
);

-- Drop ALL old conflicting policies
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Cashier can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Cashier can update orders" ON public.orders;
DROP POLICY IF EXISTS "Allow user to insert own order" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated to view all orders" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated to update orders" ON public.orders;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to place orders (email must match their login)
DROP POLICY IF EXISTS "Allow user to insert own order" ON public.orders;
CREATE POLICY "Allow user to insert own order"
ON public.orders FOR INSERT TO authenticated
WITH CHECK ( (auth.jwt() ->> 'email') = "user" );

-- Policy to allow users to see their own orders AND Cashiers to see all
DROP POLICY IF EXISTS "Allow authenticated to view all orders" ON public.orders;
CREATE POLICY "Allow authenticated to view all orders"
ON public.orders FOR SELECT TO authenticated
USING ( true );

-- Policy to allow updating orders (for status changes by cashier)
DROP POLICY IF EXISTS "Allow authenticated to update orders" ON public.orders;
CREATE POLICY "Allow authenticated to update orders"
ON public.orders FOR UPDATE TO authenticated
USING ( true )
WITH CHECK ( true );


-- 2. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

DROP POLICY IF EXISTS "Users can manage their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow user to read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow authenticated to insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow user to update own notifications" ON public.notifications;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow user to read own notifications"
ON public.notifications FOR SELECT TO authenticated
USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Allow authenticated to insert notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow user to update own notifications"
ON public.notifications FOR UPDATE TO authenticated
USING (auth.jwt() ->> 'email' = user_email);


-- 3. FAVOURITES TABLE
CREATE TABLE IF NOT EXISTS public.favourites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    item_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_email, item_id)
);

DROP POLICY IF EXISTS "Users can manage their own favourites" ON public.favourites;
ALTER TABLE public.favourites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own favourites"
ON public.favourites FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = user_email)
WITH CHECK (auth.jwt() ->> 'email' = user_email);


-- 4. APP SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.app_settings (
    setting_key TEXT PRIMARY KEY,
    setting_value JSONB NOT NULL
);

DROP POLICY IF EXISTS "Anyone can read settings" ON public.app_settings;
DROP POLICY IF EXISTS "Authenticated can update settings" ON public.app_settings;
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


-- 5. LEGAL CONTENT TABLE
CREATE TABLE IF NOT EXISTS public.legal_content (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

DROP POLICY IF EXISTS "Anyone can read legal content" ON public.legal_content;
ALTER TABLE public.legal_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read legal content"
ON public.legal_content FOR SELECT
USING (true);

INSERT INTO public.legal_content (id, title, content)
VALUES ('privacy-policy', 'Privacy Policy', 'We collect your email for OTP verification.')
ON CONFLICT (id) DO NOTHING;


-- ====== REALTIME SETUP ======
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

BEGIN;
  DO $$ BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.orders';
  EXCEPTION WHEN undefined_object OR sqlstate '42P01' THEN NULL;
  END $$;
  DO $$ BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.notifications';
  EXCEPTION WHEN undefined_object OR sqlstate '42P01' THEN NULL;
  END $$;
  
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
COMMIT;
