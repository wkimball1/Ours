-- Week-based content progression
-- Adds week_number to content_sets so prompts are served based on how long a
-- couple has been on the app (week 1 = first 7 days, week 2 = days 8-14, etc.)
-- with a transparent cycle-back after the last week of content.
--
-- Also adds joined_date as a stored computed column on couples so we never
-- have to re-parse created_at timestamps and avoid timezone drift bugs.

-- 1. joined_date on couples: stable UTC calendar date of signup
ALTER TABLE couples
  ADD COLUMN IF NOT EXISTS joined_date date
  GENERATED ALWAYS AS (created_at::date) STORED;

-- 2. week_number on content_sets
ALTER TABLE content_sets
  ADD COLUMN IF NOT EXISTS week_number int;

-- 3. Backfill existing Week 1 content
UPDATE content_sets SET week_number = 1 WHERE name LIKE 'Week 1%';

-- 4. Indexes for the primary lookup path: type + day_index + week_number
CREATE INDEX IF NOT EXISTS content_sets_daily_lookup
  ON content_sets (type, day_index, week_number)
  WHERE is_active = true;

-- 5. Index for cycle fallback and weekly lookup: type + week_number
CREATE INDEX IF NOT EXISTS content_sets_weekly_lookup
  ON content_sets (type, week_number)
  WHERE is_active = true;
