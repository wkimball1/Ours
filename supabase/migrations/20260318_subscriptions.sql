-- Add trial window to couples
ALTER TABLE couples ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '14 days');

-- Backfill: existing couples' trial starts from when they were created
UPDATE couples SET trial_ends_at = created_at + INTERVAL '14 days';

-- Subscriptions table (one row per couple, created when they subscribe)
CREATE TABLE IF NOT EXISTS subscriptions (
  couple_id            UUID PRIMARY KEY REFERENCES couples(id) ON DELETE CASCADE,
  stripe_customer_id   TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status               TEXT NOT NULL DEFAULT 'trialing'
                         CHECK (status IN ('trialing','active','past_due','canceled','incomplete')),
  plan                 TEXT NOT NULL DEFAULT 'monthly'
                         CHECK (plan IN ('monthly','annual')),
  current_period_end   TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Couple members can read their own subscription row
CREATE POLICY "couple members can read their subscription"
  ON subscriptions FOR SELECT
  USING (
    couple_id IN (
      SELECT id FROM couples
      WHERE member1 = auth.uid() OR member2 = auth.uid()
    )
  );
