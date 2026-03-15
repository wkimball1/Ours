-- ============================================================
-- New features migration
-- Run this against your Supabase database.
-- ============================================================

-- 1. Love note reactions
-- Adds a nullable 'reaction' column to love_notes.
-- Allowed values: 💛, 🥹, 😂 (enforced in app code)
ALTER TABLE love_notes
  ADD COLUMN IF NOT EXISTS reaction text;

-- 2. Shared bucket list
CREATE TABLE IF NOT EXISTS bucket_list_items (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id    uuid        NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  created_by   uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  content      text        NOT NULL CHECK (char_length(content) <= 500),
  completed_at timestamptz,
  created_at   timestamptz DEFAULT now() NOT NULL
);

-- Index for fast couple lookups
CREATE INDEX IF NOT EXISTS bucket_list_items_couple_id_idx
  ON bucket_list_items (couple_id);

-- Row-level security: members of the couple can read/write their items
ALTER TABLE bucket_list_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Couple members can manage bucket list" ON bucket_list_items;
CREATE POLICY "Couple members can manage bucket list"
  ON bucket_list_items
  FOR ALL
  USING (
    couple_id IN (
      SELECT id FROM couples
      WHERE member1 = auth.uid() OR member2 = auth.uid()
    )
  )
  WITH CHECK (
    couple_id IN (
      SELECT id FROM couples
      WHERE member1 = auth.uid() OR member2 = auth.uid()
    )
  );

-- 3. Notification preferences on profiles
-- Stored as JSONB: { "email_love_note": bool, "email_reassurance": bool, "email_session_unlocked": bool }
-- Absent keys default to true (opt-in) — enforced in application code.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS notification_prefs jsonb DEFAULT '{}'::jsonb NOT NULL;
