-- ============================================================
-- Migration 002: Security constraints & game integrity rules
-- ============================================================

-- 1. CHECK constraints on game_states
--    (guards against direct Supabase API abuse)
ALTER TABLE game_states
  ADD CONSTRAINT IF NOT EXISTS coin_balance_non_negative
    CHECK (coin_balance >= 0),
  ADD CONSTRAINT IF NOT EXISTS coin_balance_max
    CHECK (coin_balance <= 100000),
  ADD CONSTRAINT IF NOT EXISTS total_flips_non_negative
    CHECK (total_flips >= 0),
  ADD CONSTRAINT IF NOT EXISTS username_format
    CHECK (
      username IS NULL OR (
        char_length(username) BETWEEN 3 AND 20 AND
        username ~ '^[a-zA-Z0-9_]+$'
      )
    );

-- 2. Integrity trigger: prevent cheating via direct DB writes
--    - total_flips may never decrease
--    - coin_balance may not jump by more than 500 per UPDATE
--      (legit max per flip = ~12 coins; 500 is a safe buffer
--       that also covers the initial grant on first INSERT)
--    - always stamp updated_at
CREATE OR REPLACE FUNCTION enforce_game_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- total_flips is strictly non-decreasing
  IF NEW.total_flips < OLD.total_flips THEN
    RAISE EXCEPTION 'total_flips cannot decrease'
      USING ERRCODE = 'P0001';
  END IF;

  -- Prevent arbitrary balance jumps (exploiting the REST API directly)
  IF NEW.coin_balance > OLD.coin_balance + 500 THEN
    RAISE EXCEPTION 'Coin balance increase (%) exceeds the per-operation maximum',
      (NEW.coin_balance - OLD.coin_balance)
      USING ERRCODE = 'P0001';
  END IF;

  -- Always keep updated_at accurate
  NEW.updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS game_integrity_trigger ON game_states;
CREATE TRIGGER game_integrity_trigger
  BEFORE UPDATE ON game_states
  FOR EACH ROW EXECUTE FUNCTION enforce_game_integrity();

-- 3. Tighten RLS policies
--    Drop old ones (names may vary) and recreate cleanly

DROP POLICY IF EXISTS "Allow public read for leaderboard" ON game_states;
DROP POLICY IF EXISTS "leaderboard_read"                  ON game_states;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own state" ON game_states;
DROP POLICY IF EXISTS "users_insert_own"                  ON game_states;
DROP POLICY IF EXISTS "Allow authenticated users to update their own state" ON game_states;
DROP POLICY IF EXISTS "users_update_own"                  ON game_states;

-- Leaderboard: only expose rows that have a display name
CREATE POLICY "leaderboard_read" ON game_states
  FOR SELECT
  TO anon, authenticated
  USING (username IS NOT NULL AND char_length(username) >= 1);

-- Insert: authenticated users may only create their own row
CREATE POLICY "users_insert_own" ON game_states
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Update: authenticated users may only update their own row
CREATE POLICY "users_update_own" ON game_states
  FOR UPDATE
  TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- No DELETE policy → nobody can delete rows
