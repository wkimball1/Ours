-- ============================================================
-- 1. Extend this_or_that_questions to absorb WYR question types
-- ============================================================

-- 'preference' = classic This or That (Coffee or Tea?)
-- 'hypothetical' = Would You Rather scenario
ALTER TABLE this_or_that_questions
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'preference'
    CHECK (type IN ('preference', 'hypothetical'));

-- day_index: when set, this question is eligible for the daily featured slot
ALTER TABLE this_or_that_questions
  ADD COLUMN IF NOT EXISTS day_index INT;

-- ============================================================
-- 2. Finish the Sentence
-- ============================================================

CREATE TABLE IF NOT EXISTS finish_sentence_prompts (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_text TEXT   NOT NULL,
  day_index  INT     NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE finish_sentence_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated users can read finish sentence prompts"
  ON finish_sentence_prompts FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE TABLE IF NOT EXISTS finish_sentence_answers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id   UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  prompt_id   UUID NOT NULL REFERENCES finish_sentence_prompts(id),
  answer_text TEXT NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (couple_id, user_id, session_date)
);

ALTER TABLE finish_sentence_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "couple members can manage own finish sentence answers"
  ON finish_sentence_answers FOR ALL
  TO authenticated
  USING (
    couple_id IN (
      SELECT id FROM couples WHERE member1 = auth.uid() OR member2 = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    AND couple_id IN (
      SELECT id FROM couples WHERE member1 = auth.uid() OR member2 = auth.uid()
    )
  );

-- ============================================================
-- 3. Seed: starter Finish the Sentence prompts
-- ============================================================

INSERT INTO finish_sentence_prompts (prompt_text, day_index) VALUES
  ('The thing I miss most about you right now is', 1),
  ('Lately I've been thinking about us and', 2),
  ('If we were together tonight I'd want to', 3),
  ('Something I don't say enough is', 4),
  ('The moment I feel closest to you is when', 5),
  ('A small thing you do that means a lot to me is', 6),
  ('When I imagine our future I see', 7),
  ('The last time you made me laugh really hard was when', 8),
  ('Something that reminded me of you this week was', 9),
  ('If I could give you anything today it would be', 10),
  ('What I appreciate most about how you love me is', 11),
  ('A worry I've been carrying lately is', 12),
  ('One thing I want you to know is', 13),
  ('My favourite memory of us so far is', 14)
ON CONFLICT DO NOTHING;
