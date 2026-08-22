-- supabase/migrations/0002_verification_and_fixes.sql
--
-- Run this once against the production database (Supabase dashboard → SQL editor).
-- Everything here is idempotent: running it twice is harmless.
--
-- WHY: the live schema had drifted well beyond 0001_initial.sql — several
-- columns the application reads and writes every day were never in a migration
-- file, so a fresh environment could not be rebuilt from this repo. This file
-- brings the two back into line and adds the indexes the verification queue and
-- the browse page need.

-- ── Columns the app relies on ────────────────────────────────────────────────

-- The private storage PATH of the user's identity document (never a public URL).
ALTER TABLE users ADD COLUMN IF NOT EXISTS id_document_url VARCHAR(500);

-- 'direct' or 'auction'. Auction buyers accept the no-show ban rule.
ALTER TABLE users ADD COLUMN IF NOT EXISTS buyer_type VARCHAR(20) DEFAULT 'direct';

-- Listing detail columns written by /api/cars/create.
ALTER TABLE cars ADD COLUMN IF NOT EXISTS street_address VARCHAR(255);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS power INTEGER;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS vin VARCHAR(64);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS first_registration VARCHAR(32);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS additional_features TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS listing_fee_paid DECIMAL(10, 2) DEFAULT 0;

-- transaction_logs.car_id is written by /api/cars/create, /api/bids/create and
-- the feature endpoint, but it was never in a migration. If it is missing, every
-- one of those ledger inserts fails silently — money moves and nothing is
-- recorded.
ALTER TABLE transaction_logs ADD COLUMN IF NOT EXISTS car_id INTEGER REFERENCES cars(id) ON DELETE SET NULL;

-- bids.status is set to 'outbid' by both bid endpoints, but the original CHECK
-- constraint only allowed pending/won/lost/cancelled, so that UPDATE always
-- failed and losing bids stayed marked 'pending'.
-- Drop whatever CHECK currently governs bids.status, whatever it happens to be
-- called. Guessing the constraint name would silently leave the old one in
-- place on a database whose schema has drifted.
DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE rel.relname = 'bids' AND nsp.nspname = 'public'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) ILIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE bids DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

ALTER TABLE bids ADD CONSTRAINT bids_status_check
  CHECK (status IN ('pending', 'outbid', 'won', 'lost', 'cancelled', 'refunded'));

-- ── Verification queue ───────────────────────────────────────────────────────
-- The admin panel's "waiting for approval" list filters on exactly this.
CREATE INDEX IF NOT EXISTS idx_users_pending_verification
  ON users (created_at DESC)
  WHERE verified = false AND banned = false;

-- ── Browse page ──────────────────────────────────────────────────────────────
-- /api/cars lists both 'active' (normal) and 'auction' (live auction) rows.
CREATE INDEX IF NOT EXISTS idx_cars_status_created ON cars (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cars_seller ON cars (seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bids_car_status ON bids (car_id, status, amount DESC);
CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages (chat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_user ON transaction_logs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bids_car_pending ON bids (car_id) WHERE status = 'pending';

-- ── Safety net for the plain-text password column ────────────────────────────
-- Authentication moved to Supabase Auth long ago; users.password is dead weight
-- and is NOT NULL, which makes every INSERT that forgets it fail. Make it
-- optional. (Dropping it entirely is the right end state, but only do that once
-- you have confirmed nothing else reads it.)
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
ALTER TABLE users ALTER COLUMN password SET DEFAULT '';


-- ─────────────────────────────────────────────────────────────────────────────
-- Atomic wallet movement
-- ─────────────────────────────────────────────────────────────────────────────
-- Every wallet change in the app was a read-modify-write of an ABSOLUTE
-- balance: read funds, add or subtract in JavaScript, write the result back.
-- Two operations that overlap (a bid and a listing fee, two bids on the same
-- auction) silently erase each other — one of them simply never happened, and
-- the ledger disagrees with the wallet.
--
-- This function does the whole thing in one statement under a row lock, so
-- concurrent movements queue instead of clobbering. The server calls it through
-- RPC and falls back to the old read-modify-write if it is not present, so the
-- app keeps working either way — but run this and the race disappears.
CREATE OR REPLACE FUNCTION adjust_user_funds(
  p_user_id integer,
  p_delta numeric,
  p_allow_negative boolean DEFAULT false
)
RETURNS TABLE (previous_balance numeric, new_balance numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  prev numeric;
  nextv numeric;
BEGIN
  -- coalesce, and test existence separately: a legitimate user whose funds
  -- column happens to be NULL is not a missing user.
  SELECT coalesce(funds, 0) INTO prev FROM users WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'user % not found', p_user_id USING ERRCODE = 'no_data_found';
  END IF;

  nextv := prev + p_delta;
  IF nextv < 0 AND NOT p_allow_negative THEN
    RAISE EXCEPTION 'insufficient funds' USING ERRCODE = 'check_violation';
  END IF;

  UPDATE users SET funds = nextv WHERE id = p_user_id;

  previous_balance := prev;
  new_balance := nextv;
  RETURN NEXT;
END;
$$;

-- SECURITY DEFINER means this function can move money, so it must NOT be
-- reachable from the browser. Only the server (service_role) may call it.
REVOKE ALL ON FUNCTION adjust_user_funds(integer, numeric, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION adjust_user_funds(integer, numeric, boolean) FROM anon;
REVOKE ALL ON FUNCTION adjust_user_funds(integer, numeric, boolean) FROM authenticated;
GRANT EXECUTE ON FUNCTION adjust_user_funds(integer, numeric, boolean) TO service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- Storage buckets ──────────────────────────────────────────────────
-- These cannot be created from SQL. In Supabase Storage make sure you have:
--   • car-images      → PUBLIC   (listing photos are shown to everyone)
--   • user-documents  → PRIVATE  (ID documents; admins read them through
--                                 short-lived signed URLs)
-- If 'user-documents' does not exist, registration will fail with
-- "We could not store your identity document".
