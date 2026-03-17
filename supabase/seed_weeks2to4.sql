-- Weeks 2–4 seed content
-- Content strategy: couple-age progression arc
--   Week 1: Noticing (feeling chosen, warmth, small things)
--   Week 2: Going Deeper (habits, being known, pride, growth)
--   Week 3: What Makes Us Stronger (safe vulnerability, repair, choosing each other)
--   Week 4: Where We're Going (future, vision, commitment)
--
-- Prompt revisions informed by relationship psychology review:
-- - Week 3 renamed from "The Hard Parts" to "What Makes Us Stronger"
-- - All Week 3 prompts reframed toward repair-intent and strength rather than
--   conflict-surfacing or failure-cataloging
-- - "What I hold back" reframed to avoid shame or unresolved conflict

-- ─── Content sets ────────────────────────────────────────────────────────────

insert into content_sets (name, type, day_index, week_number, is_active, theme)
values
  -- Week 2
  ('Week 2 - Day 1', 'daily', 1, 2, true, 'growing together'),
  ('Week 2 - Day 2', 'daily', 2, 2, true, 'being known'),
  ('Week 2 - Day 3', 'daily', 3, 2, true, 'pride & growth'),
  ('Week 2 - Day 4', 'daily', 4, 2, true, 'being seen'),
  ('Week 2 - Day 5', 'daily', 5, 2, true, 'gratitude unsaid'),
  ('Week 2 - Day 6', 'daily', 6, 2, true, 'your rituals'),
  ('Week 2 - Weekly Reset', 'weekly', null, 2, true, 'your second week'),

  -- Week 3
  ('Week 3 - Day 1', 'daily', 1, 3, true, 'brave sharing'),
  ('Week 3 - Day 2', 'daily', 2, 3, true, 'understanding each other'),
  ('Week 3 - Day 3', 'daily', 3, 3, true, 'safety & repair'),
  ('Week 3 - Day 4', 'daily', 4, 3, true, 'choosing each other'),
  ('Week 3 - Day 5', 'daily', 5, 3, true, 'commitment'),
  ('Week 3 - Day 6', 'daily', 6, 3, true, 'repair & love'),
  ('Week 3 - Weekly Reset', 'weekly', null, 3, true, 'coming back to each other'),

  -- Week 4
  ('Week 4 - Day 1', 'daily', 1, 4, true, 'our future'),
  ('Week 4 - Day 2', 'daily', 2, 4, true, 'shaped by you'),
  ('Week 4 - Day 3', 'daily', 3, 4, true, 'dreaming together'),
  ('Week 4 - Day 4', 'daily', 4, 4, true, 'building together'),
  ('Week 4 - Day 5', 'daily', 5, 4, true, 'the life we want'),
  ('Week 4 - Day 6', 'daily', 6, 4, true, 'right now'),
  ('Week 4 - Weekly Reset', 'weekly', null, 4, true, 'your first month');

-- ─── Prompts ─────────────────────────────────────────────────────────────────

with cs as (select id, name from content_sets)
insert into prompts (content_set_id, step_index, prompt_text)
select id, step_index, prompt_text
from (

  -- ── Week 2 ──────────────────────────────────────────────────────────────

  -- Day 1: growing together
  select (select id from cs where name = 'Week 2 - Day 1') as id, 1 as step_index,
    'Something I''ve been wanting to tell you but kept finding the wrong moment.' as prompt_text
  union all select (select id from cs where name = 'Week 2 - Day 1'), 2,
    'The version of you I feel most connected to is…'
  union all select (select id from cs where name = 'Week 2 - Day 1'), 3,
    'One way I''ve grown because of being with you.'

  -- Day 2: being known
  union all select (select id from cs where name = 'Week 2 - Day 2'), 1,
    'A habit or quirk of yours I''ve quietly come to love.'
  union all select (select id from cs where name = 'Week 2 - Day 2'), 2,
    'When I''m stressed, what helps most is when you…'
  union all select (select id from cs where name = 'Week 2 - Day 2'), 3,
    'Something I feel, but don''t always say out loud, because I assume you already know.'

  -- Day 3: pride & growth
  union all select (select id from cs where name = 'Week 2 - Day 3'), 1,
    'A moment recently where I felt proud of us.'
  union all select (select id from cs where name = 'Week 2 - Day 3'), 2,
    'Something I''m still learning about how to love you better.'
  union all select (select id from cs where name = 'Week 2 - Day 3'), 3,
    'One thing I''d love us to try or do together that we haven''t yet.'

  -- Day 4: being seen
  union all select (select id from cs where name = 'Week 2 - Day 4'), 1,
    'The last time I felt really seen by you was…'
  union all select (select id from cs where name = 'Week 2 - Day 4'), 2,
    'One thing I appreciate about how you handle hard moments.'
  union all select (select id from cs where name = 'Week 2 - Day 4'), 3,
    'One thing I could do this week to make you feel more chosen.'

  -- Day 5: gratitude unsaid
  union all select (select id from cs where name = 'Week 2 - Day 5'), 1,
    'A way you''ve shown up for me that I haven''t thanked you enough for.'
  union all select (select id from cs where name = 'Week 2 - Day 5'), 2,
    'When we disagree, I feel closest to us again when…'
  union all select (select id from cs where name = 'Week 2 - Day 5'), 3,
    'One small thing that made me feel especially loved by you this week.'

  -- Day 6: your rituals
  union all select (select id from cs where name = 'Week 2 - Day 6'), 1,
    'A small ritual or routine we have that I never want to lose.'
  union all select (select id from cs where name = 'Week 2 - Day 6'), 2,
    'The moment I knew this was real with you.'
  union all select (select id from cs where name = 'Week 2 - Day 6'), 3,
    'Send a short message: "Lately I''ve been feeling grateful for you because…"'

  -- Weekly Reset: your second week
  union all select (select id from cs where name = 'Week 2 - Weekly Reset'), 1,
    'What felt good between us this week?'
  union all select (select id from cs where name = 'Week 2 - Weekly Reset'), 2,
    'Was there a moment I pulled away or held something back?'
  union all select (select id from cs where name = 'Week 2 - Weekly Reset'), 3,
    'When did I feel most like us this week?'
  union all select (select id from cs where name = 'Week 2 - Weekly Reset'), 4,
    'What would make next week feel more connected?'
  union all select (select id from cs where name = 'Week 2 - Weekly Reset'), 5,
    'One thing I want to appreciate you for.'
  union all select (select id from cs where name = 'Week 2 - Weekly Reset'), 6,
    'One thing I want to be more intentional about.'

  -- ── Week 3: What Makes Us Stronger ──────────────────────────────────────
  -- Prompts revised for safe vulnerability: repair-intent framing, strength-
  -- based language, no failure-catalog or shame-inducing asks.

  -- Day 1: brave sharing
  union all select (select id from cs where name = 'Week 3 - Day 1'), 1,
    'Something I sometimes find hard to bring to you — not because I''m afraid, but because I''m still figuring out how to say it.'
  union all select (select id from cs where name = 'Week 3 - Day 1'), 2,
    'A moment where I wanted to be there for you and wasn''t sure I got it right — and what I wish I''d done.'
  union all select (select id from cs where name = 'Week 3 - Day 1'), 3,
    'One thing that helps me come back to you after a hard moment.'

  -- Day 2: understanding each other
  union all select (select id from cs where name = 'Week 3 - Day 2'), 1,
    'Something I sometimes misread about you that I''m still learning.'
  union all select (select id from cs where name = 'Week 3 - Day 2'), 2,
    'When I go quiet, what''s usually happening for me is…'
  union all select (select id from cs where name = 'Week 3 - Day 2'), 3,
    'One thing I wish we handled differently when things get hard — said with love, not blame.'

  -- Day 3: safety & repair
  union all select (select id from cs where name = 'Week 3 - Day 3'), 1,
    'Something I sometimes worry about in my own ability to love you well.'
  union all select (select id from cs where name = 'Week 3 - Day 3'), 2,
    'Something you do that makes repair feel easier.'
  union all select (select id from cs where name = 'Week 3 - Day 3'), 3,
    'Something I need more of from you that I haven''t found the right words for yet.'

  -- Day 4: choosing each other
  union all select (select id from cs where name = 'Week 3 - Day 4'), 1,
    'A moment where I felt like we got it right, even when it was hard.'
  union all select (select id from cs where name = 'Week 3 - Day 4'), 2,
    'Something I need to hear from you more often.'
  union all select (select id from cs where name = 'Week 3 - Day 4'), 3,
    'One thing I want us to stop letting go unsaid.'

  -- Day 5: commitment
  union all select (select id from cs where name = 'Week 3 - Day 5'), 1,
    'What choosing you has cost me — and why it''s worth it.'
  union all select (select id from cs where name = 'Week 3 - Day 5'), 2,
    'Something I''ve been carrying quietly that I want to share with you.'
  union all select (select id from cs where name = 'Week 3 - Day 5'), 3,
    'One way I want to fight for us rather than with you.'

  -- Day 6: repair & love
  union all select (select id from cs where name = 'Week 3 - Day 6'), 1,
    'A moment of repair between us I''m proud of.'
  union all select (select id from cs where name = 'Week 3 - Day 6'), 2,
    'Something you''ve forgiven me for that I''m still grateful for.'
  union all select (select id from cs where name = 'Week 3 - Day 6'), 3,
    'Send a short message: "I''m still here. I still choose you. Because…"'

  -- Weekly Reset: coming back to each other
  -- Ends on affirmation and reconnection, not problem-solving.
  union all select (select id from cs where name = 'Week 3 - Weekly Reset'), 1,
    'Was there tension between us this week? What was underneath it?'
  union all select (select id from cs where name = 'Week 3 - Weekly Reset'), 2,
    'Did I feel safe enough to be honest with you?'
  union all select (select id from cs where name = 'Week 3 - Weekly Reset'), 3,
    'What helped us come back to each other?'
  union all select (select id from cs where name = 'Week 3 - Weekly Reset'), 4,
    'What do I need more of to feel secure with you?'
  union all select (select id from cs where name = 'Week 3 - Weekly Reset'), 5,
    'One thing I want to say that I''ve been holding.'
  union all select (select id from cs where name = 'Week 3 - Weekly Reset'), 6,
    'One intention for how I want to show up next week.'

  -- ── Week 4: Where We're Going ────────────────────────────────────────────
  -- Future/vision content: expansive, activates shared hope. Safest emotional
  -- register in the arc. Prompts revised for specificity over vagueness.

  -- Day 1: our future
  union all select (select id from cs where name = 'Week 4 - Day 1'), 1,
    'A version of our future I find myself daydreaming about.'
  union all select (select id from cs where name = 'Week 4 - Day 1'), 2,
    'One thing I want us to protect as we grow together.'
  union all select (select id from cs where name = 'Week 4 - Day 1'), 3,
    'One thing I hope we''re still doing together in ten years that we do now.'

  -- Day 2: shaped by you
  union all select (select id from cs where name = 'Week 4 - Day 2'), 1,
    'A quality in you I hope shapes who I become.'
  union all select (select id from cs where name = 'Week 4 - Day 2'), 2,
    'Something I want us to keep making time for, always.'
  union all select (select id from cs where name = 'Week 4 - Day 2'), 3,
    'One thing about us I want to be true in five years.'

  -- Day 3: dreaming together
  union all select (select id from cs where name = 'Week 4 - Day 3'), 1,
    'A dream I have that I want to share with you.'
  union all select (select id from cs where name = 'Week 4 - Day 3'), 2,
    'Something I''m working on in myself, for us.'
  union all select (select id from cs where name = 'Week 4 - Day 3'), 3,
    'One way I want to love you better going forward.'

  -- Day 4: building together
  union all select (select id from cs where name = 'Week 4 - Day 4'), 1,
    'Something I want us to deliberately make room for this year.'
  union all select (select id from cs where name = 'Week 4 - Day 4'), 2,
    'A value or belief we share that feels like a foundation.'
  union all select (select id from cs where name = 'Week 4 - Day 4'), 3,
    'One thing I''m committed to bringing more of.'

  -- Day 5: the life we want
  union all select (select id from cs where name = 'Week 4 - Day 5'), 1,
    'The life I want us to be living in a year — describe one specific moment in it.'
  union all select (select id from cs where name = 'Week 4 - Day 5'), 2,
    'Something I want us to say yes to together.'
  union all select (select id from cs where name = 'Week 4 - Day 5'), 3,
    'One small thing I could start doing this week to move toward that.'

  -- Day 6: right now
  union all select (select id from cs where name = 'Week 4 - Day 6'), 1,
    'A moment that already feels like the life I want.'
  union all select (select id from cs where name = 'Week 4 - Day 6'), 2,
    'Something I want to remember about us right now.'
  union all select (select id from cs where name = 'Week 4 - Day 6'), 3,
    'Send a short message: "Here''s what I''m building toward, with you…"'

  -- Weekly Reset: your first month
  -- Celebratory framing — completing the first arc is a milestone.
  union all select (select id from cs where name = 'Week 4 - Weekly Reset'), 1,
    'What felt most alive between us this week?'
  union all select (select id from cs where name = 'Week 4 - Weekly Reset'), 2,
    'Is there anything we''ve been putting off that needs attention?'
  union all select (select id from cs where name = 'Week 4 - Weekly Reset'), 3,
    'What are we doing well that I want us to keep?'
  union all select (select id from cs where name = 'Week 4 - Weekly Reset'), 4,
    'What''s one thing I want us to try or prioritize next month?'
  union all select (select id from cs where name = 'Week 4 - Weekly Reset'), 5,
    'One thing I''m grateful for about who we are together.'
  union all select (select id from cs where name = 'Week 4 - Weekly Reset'), 6,
    'One thing I want to carry forward from this month.'

) p;
