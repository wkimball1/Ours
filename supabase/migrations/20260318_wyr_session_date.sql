-- Scope WYR answers by day so questions feel fresh when they recycle
-- and old answers don't bleed through.
ALTER TABLE would_you_rather_answers
  ADD COLUMN IF NOT EXISTS session_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Drop the old permanent uniqueness constraint (one answer per question per couple/user)
ALTER TABLE would_you_rather_answers
  DROP CONSTRAINT IF EXISTS would_you_rather_answers_couple_id_user_id_question_id_key;

-- New constraint: one answer per person per day
ALTER TABLE would_you_rather_answers
  ADD CONSTRAINT wyr_answers_daily_unique UNIQUE (couple_id, user_id, session_date);
