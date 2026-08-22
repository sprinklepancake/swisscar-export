-- supabase/migrations/0003_rls_hardening.sql
--
-- ⚠️  THIS IS THE MOST IMPORTANT MIGRATION. It closes two holes that make every
--     other rule on the site unenforceable.
--
--     RUN 0002 FIRST. The trigger below freezes users.id_document_url, and that
--     column is added by 0002 — running this file first fails with
--     "record \"new\" has no field \"id_document_url\"".
--     Order: 0002 → 0003. Both are idempotent, so re-running is safe.
--
-- THE PROBLEM
-- ───────────
-- The Supabase anon key is public — it ships inside the JavaScript bundle, as it
-- is designed to. Row Level Security is therefore the only thing standing
-- between a visitor and the database. Two policies from 0001_initial.sql were
-- far too permissive:
--
--   CREATE POLICY "Users can update own profile" ON users
--     FOR UPDATE USING (auth.uid()::text = auth_uid::text);
--
-- That lets a signed-in user run this straight from their browser console:
--
--   supabase.from('users')
--     .update({ role: 'admin', verified: true, banned: false, funds: 999999 })
--     .eq('auth_uid', '<their own uid>')
--
-- …making themselves an administrator with an unlimited wallet. Admin approval,
-- the ban list and the listing fee are all bypassed in one request.
--
--   CREATE POLICY "Sellers can manage own cars" ON cars
--     FOR ALL USING (seller_id IN (SELECT id FROM users WHERE auth_uid = auth.uid()));
--
-- That lets the same user INSERT listings directly, skipping /api/cars/create —
-- so skipping the verification check and the 7.50 / 10.00 CHF fee.
--
-- THE FIX
-- ───────
-- 1. Keep users able to update their own row (the app writes last_login and
--    login_count on every sign-in), but freeze the columns that grant privilege
--    or money. A trigger is used because a policy cannot compare NEW to OLD.
-- 2. Make `cars` read-only for browsers. Every write already goes through a
--    Nitro API route using the service-role key, which bypasses RLS.
--
-- Run it in the Supabase dashboard → SQL editor. It is idempotent.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Freeze privilege and money columns on `users`
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION protect_user_privilege_columns()
RETURNS TRIGGER AS $$
DECLARE
  jwt_role text;
  active_role text;
BEGIN
  -- NOTE: this function must NOT be SECURITY DEFINER. Inside a SECURITY DEFINER
  -- function current_user is the function's OWNER (normally postgres), so a
  -- current_user check would pass for everybody and the whole trigger would be
  -- a silent no-op. Three independent signals are checked so the guard cannot
  -- be defeated by one of them being unexpected:
  --   current_user                  → 'authenticated' under SECURITY INVOKER
  --   current_setting('role')       → 'authenticated' even under SECURITY DEFINER
  --   request.jwt.claims ->> 'role' → what PostgREST put in the JWT
  BEGIN
    jwt_role := coalesce(current_setting('request.jwt.claims', true)::json ->> 'role', '');
  EXCEPTION WHEN others THEN
    jwt_role := '';
  END;

  BEGIN
    active_role := coalesce(current_setting('role', true), '');
  EXCEPTION WHEN others THEN
    active_role := '';
  END;

  -- Only browser sessions are restricted. The server (service-role key), the
  -- Supabase dashboard and psql may change anything.
  IF current_user     NOT IN ('authenticated', 'anon')
     AND active_role  NOT IN ('authenticated', 'anon')
     AND jwt_role     NOT IN ('authenticated', 'anon') THEN
    RETURN NEW;
  END IF;

  -- Silently keep the old value for everything a user must not set themselves.
  NEW.role                 := OLD.role;
  NEW.verified             := OLD.verified;
  NEW.verified_buyer       := OLD.verified_buyer;
  NEW.banned               := OLD.banned;
  NEW.funds                := OLD.funds;
  NEW.free_feature_credits := OLD.free_feature_credits;
  NEW.used_free_features   := OLD.used_free_features;
  NEW.total_listings       := OLD.total_listings;
  NEW.id_document_url      := OLD.id_document_url;
  NEW.email                := OLD.email;
  NEW.auth_uid             := OLD.auth_uid;
  NEW.id                   := OLD.id;
  -- created_at decides the "first six months are free" window in
  -- /api/cars/create. Left writable, a user could push it forward and never pay
  -- a listing fee again.
  NEW.created_at           := OLD.created_at;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

DROP TRIGGER IF EXISTS protect_user_privilege_columns_trg ON users;
CREATE TRIGGER protect_user_privilege_columns_trg
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION protect_user_privilege_columns();

-- Browsers must not be able to create or delete profile rows either;
-- registration goes through /api/auth/register with the service-role key.
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can delete own profile" ON users;

-- Re-assert the two policies a browser genuinely needs, with an explicit
-- WITH CHECK so a user can never move their row onto another auth_uid.
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = auth_uid::text);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (auth.uid()::text = auth_uid::text)
  WITH CHECK (auth.uid()::text = auth_uid::text);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Make `cars` read-only from the browser
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Sellers can manage own cars" ON cars;

-- Sellers can still READ their own listings in any state (draft, sold, ended).
DROP POLICY IF EXISTS "Sellers can view own cars" ON cars;
CREATE POLICY "Sellers can view own cars" ON cars
  FOR SELECT USING (seller_id IN (SELECT id FROM users WHERE auth_uid = auth.uid()));

-- Public browsing: 'active' is a normal listing, 'auction' is a live auction.
-- The old policy only allowed 'active', so auctions were invisible to any
-- client-side query.
DROP POLICY IF EXISTS "Public can view active cars" ON cars;
DROP POLICY IF EXISTS "Public can view live cars" ON cars;
CREATE POLICY "Public can view live cars" ON cars
  FOR SELECT USING (status IN ('active', 'auction', 'auction_ended', 'sold'));

-- No INSERT / UPDATE / DELETE policy is defined, so RLS denies all writes from
-- the anon and authenticated roles. The API routes use the service-role key and
-- are unaffected.

-- RLS is ROW level, not COLUMN level. A browser holding the public anon key
-- could therefore SELECT * from cars and read the seller's email and street
-- address, which the /api/cars endpoints deliberately never return.
--
-- A column-level REVOKE cannot cut a hole in a table-level GRANT (Postgres
-- ignores it), so the grant has to be replaced: revoke SELECT on the table,
-- then grant it back column by column, minus the private ones. The column list
-- is built from the live schema so this keeps working as columns are added.
-- (seller_phone deliberately stays readable — showing the seller's phone number
-- publicly is a product decision.)
DO $$
DECLARE cols text;
BEGIN
  SELECT string_agg(quote_ident(column_name), ', ' ORDER BY ordinal_position)
    INTO cols
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'cars'
    AND column_name NOT IN ('seller_email', 'street_address');

  EXECUTE 'REVOKE SELECT ON public.cars FROM anon, authenticated';
  IF cols IS NOT NULL THEN
    EXECUTE format('GRANT SELECT (%s) ON public.cars TO anon, authenticated', cols);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Wallets are server-only
-- ─────────────────────────────────────────────────────────────────────────────
-- transaction_logs already has a SELECT-only policy. Make sure nothing has
-- since granted write access.
DROP POLICY IF EXISTS "Users can manage own transactions" ON transaction_logs;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transaction_logs;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Verify
-- ─────────────────────────────────────────────────────────────────────────────
-- After running this, check the result:
--
--   SELECT tablename, policyname, cmd
--   FROM pg_policies
--   WHERE schemaname = 'public'
--   ORDER BY tablename, policyname;
--
-- Expected: no INSERT / UPDATE / DELETE / ALL policy on `cars`, and exactly one
-- SELECT plus one UPDATE policy on `users`.
--
-- Then confirm the hole is closed by signing in as a normal user in the browser
-- and running, in the console:
--
--   const { data } = await useNuxtApp().$supabase
--     .from('users').update({ verified: true }).eq('auth_uid', '<uid>').select()
--
-- `data` must come back with verified still false.
