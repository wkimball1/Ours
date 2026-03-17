-- Week-based content progression
-- Adds week_number to content_sets so prompts are served based on how long a
-- couple has been on the app (week 1 = first 7 days, week 2 = days 8-14, etc.)
-- with a transparent cycle-back after the last week of content.

-- 1. week_number on content_sets
ALTER TABLE content_sets
  ADD COLUMN IF NOT EXISTS week_number int;

-- 2. Backfill existing Week 1 content
UPDATE content_sets SET week_number = 1 WHERE name LIKE 'Week 1%';

-- 3. Indexes for the primary lookup path: type + day_index + week_number
CREATE INDEX IF NOT EXISTS content_sets_daily_lookup
  ON content_sets (type, day_index, week_number)
  WHERE is_active = true;

-- 4. Index for cycle fallback and weekly lookup: type + week_number
CREATE INDEX IF NOT EXISTS content_sets_weekly_lookup
  ON content_sets (type, week_number)
  WHERE is_active = true;
