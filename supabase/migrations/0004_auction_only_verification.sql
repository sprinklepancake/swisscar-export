-- supabase/migrations/0004_auction_only_verification.sql
--
-- Run once against the production database (Supabase dashboard → SQL editor).
--
-- SAFE TO RE-RUN, but only because the backfill is explicitly guarded — see the
-- one-shot block below. Do NOT remove that guard and do not "helpfully" re-run
-- the UPDATEs by hand: the two backfill steps read the OLD meaning of
-- users.verified, and step 2 destroys that meaning. Running them a second time
-- against the new meaning would grant bidding rights to every account still
-- waiting for review and un-restrict every account an admin had restricted.
--
-- WHY
-- ───
-- Registration used to demand an identity document from EVERY new account and
-- then park that account in a "waiting for admin approval" state where it could
-- do nothing but browse. That is the wrong trade for this marketplace: the ID
-- exists to make the "bid on an auction and don't complete the purchase →
-- permanent ban" rule enforceable, and that rule only ever applies to bidders.
-- Sellers listing a car and buyers messaging a seller were being asked for a
-- passport for no reason, and then made to wait for it to be looked at.
--
-- The new model:
--   users.verified        → account is in good standing. TRUE from signup. An
--                           admin REVOKES it to restrict a problem account.
--   users.verified_buyer  → cleared to BID. Requires an ID document that an
--                           administrator has actually looked at. This column
--                           already existed (0001) and was never used.
--   users.buyer_type      → 'auction' means the account has asked for auction
--                           access; 'direct' means it never wants to bid.
--   users.id_document_url → only auction accounts ever have one.
--   users.legacy_verified → snapshot of what `verified` meant BEFORE this
--                           migration, kept so the backfill can never be
--                           re-applied against the new meaning.

-- ── Columns ──────────────────────────────────────────────────────────────────
-- verified_buyer exists since 0001, but assert it so a drifted database is fixed.
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_buyer BOOLEAN DEFAULT false;
ALTER TABLE users ALTER COLUMN verified_buyer SET DEFAULT false;
UPDATE users SET verified_buyer = false WHERE verified_buyer IS NULL;

-- The snapshot column. NULL everywhere means "the backfill has not run yet".
ALTER TABLE users ADD COLUMN IF NOT EXISTS legacy_verified BOOLEAN;

COMMENT ON COLUMN users.legacy_verified IS
  'Value of users.verified immediately before migration 0004 changed that column''s meaning from "an admin checked this ID" to "account in good standing". Written exactly once; used only as the 0004 backfill''s re-run guard. Safe to drop once you are certain 0004 will never be replayed.';

-- New accounts are usable immediately.
ALTER TABLE users ALTER COLUMN verified SET DEFAULT true;

-- ── Backfill — ONE SHOT ──────────────────────────────────────────────────────
-- Guarded by a marker row in applied_migrations. Step 1 must read the OLD
-- meaning of `verified`, and step 2 overwrites it, so a second execution
-- without this guard would:
--   * flip verified_buyer = true for every account still awaiting review, and
--     for every account an admin had deliberately revoked — voiding the ID
--     check that the auction no-show ban depends on; and
--   * clear the restriction on every account an admin had restricted.
-- The marker lives in its own table rather than being inferred from users:
-- on a database that was EMPTY at the first run, "does any row have
-- legacy_verified set?" is still false afterwards, so a second run would have
-- backfilled the accounts created in between — auto-approving them for bidding.
CREATE TABLE IF NOT EXISTS applied_migrations (
  name        TEXT PRIMARY KEY,
  applied_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM applied_migrations WHERE name = '0004_auction_only_verification') THEN
    RAISE NOTICE '0004: backfill already applied, skipping (this is expected on a re-run).';
    RETURN;
  END IF;

  -- Freeze the old meaning before anything overwrites it.
  UPDATE users SET legacy_verified = COALESCE(verified, false);

  -- 1. An auction buyer an admin had ALREADY approved under the old rules had
  --    their ID checked at that time, so they keep the right to bid. Everyone
  --    else must be approved explicitly — auction access is the one permission
  --    that is never granted automatically.
  UPDATE users
     SET verified_buyer = true
   WHERE buyer_type = 'auction'
     AND legacy_verified = true
     AND id_document_url IS NOT NULL
     AND banned IS NOT TRUE
     AND verified_buyer IS NOT TRUE;

  -- Admins can always bid.
  UPDATE users
     SET verified_buyer = true
   WHERE role = 'admin' AND banned IS NOT TRUE AND verified_buyer IS NOT TRUE;

  -- 2. Every existing account that is not banned becomes usable. Under the old
  --    rules these people were sitting in an approval queue for capabilities
  --    that no longer require approval at all.
  UPDATE users
     SET verified = true
   WHERE verified IS DISTINCT FROM true
     AND banned IS NOT TRUE;

  INSERT INTO applied_migrations (name) VALUES ('0004_auction_only_verification');
  RAISE NOTICE '0004: backfill applied.';
END $$;

-- ── The admin queue ──────────────────────────────────────────────────────────
-- "Waiting for auction approval" = asked to bid AND gave us something to look
-- at. The predicate mirrors pendingUsers() in pages/admin.vue and the count in
-- server/api/admin/stats.get.ts; all three must agree or the banner and the
-- stat card show different numbers on the same screen.
--
-- id_document_url alone is NOT enough: under the old rules every account
-- uploaded one, so that would drag the entire legacy user base into the queue.
-- buyer_type alone is not enough either: it would list accounts with nothing to
-- review, whose Approve button is disabled.
DROP INDEX IF EXISTS idx_users_pending_verification;
DROP INDEX IF EXISTS idx_users_pending_auction_approval;
CREATE INDEX idx_users_pending_auction_approval
  ON users (created_at DESC)
  WHERE verified_buyer = false
    AND banned = false
    AND buyer_type = 'auction'
    AND id_document_url IS NOT NULL;

-- ── Phone numbers ────────────────────────────────────────────────────────────
-- Numbers were stored digits-only, which silently deleted the leading '+' and
-- made every non-Swiss number unreachable ("+40 721 234 567" → "40721234567").
-- Both rules are naturally idempotent: a repaired value starts with '+', which
-- neither pattern matches.

-- 1. '00' is the ITU international prefix — the other way of writing '+'.
--    e.g. "0038163123456" is a Serbian number, not a 13-digit Swiss one.
UPDATE users
   SET phone = '+' || substring(phone from 3)
 WHERE phone ~ '^00[1-9][0-9]{6,}$';

-- 2. No prefix at all, and too long to be a national number. 11+ digits that do
--    not start with 0 already carry a country code and merely lost the '+'
--    ("41791234567" → "+41791234567").
--
--    The bound is 11, NOT 10. A 10-digit prefix-less number is genuinely
--    ambiguous — an Italian mobile is "3331234567" and a US number is
--    "4155551234"; prefixing those would silently reroute them to +33 (France)
--    and +41 (Switzerland). Leaving an ambiguous value exactly as the user
--    typed it is the only safe choice.
UPDATE users
   SET phone = '+' || phone
 WHERE phone ~ '^[1-9][0-9]{10,14}$';

-- Untouched on purpose: a single leading 0 is national format and stays that
-- way, and nothing here can push a number past E.164's 15 digits.

-- ── Notes ────────────────────────────────────────────────────────────────────
-- protect_user_privilege_columns() from 0003 already pins verified,
-- verified_buyer and id_document_url against browser-side updates, so a user
-- still cannot grant themselves auction access. buyer_type is intentionally NOT
-- pinned: asking to join the auction queue is a request, not a permission.
