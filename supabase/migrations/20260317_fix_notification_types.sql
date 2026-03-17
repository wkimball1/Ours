-- Fix notifications type constraint to include thinking_of_you and note_reaction
-- These types are used in app code but were missing from the DB check constraint,
-- causing inserts to fail with a constraint violation.

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (
  type IN (
    'reassurance_request',
    'reassurance_message',
    'system',
    'session_unlocked',
    'game_answered',
    'thinking_of_you',
    'note_reaction'
  )
);
