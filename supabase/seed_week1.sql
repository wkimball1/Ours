-- Week 1 seed content

-- Daily sets
insert into content_sets (name, type, day_index, is_active)
values
  ('Week 1 - Day 1', 'daily', 1, true),
  ('Week 1 - Day 2', 'daily', 2, true),
  ('Week 1 - Day 3', 'daily', 3, true),
  ('Week 1 - Day 4', 'daily', 4, true),
  ('Week 1 - Day 5', 'daily', 5, true),
  ('Week 1 - Day 6', 'daily', 6, true),
  ('Week 1 - Weekly Reset', 'weekly', null, true);

with cs as (select id, name from content_sets)
insert into prompts (content_set_id, step_index, prompt_text)
select id, step_index, prompt_text
from (
  -- Day 1
  select (select id from cs where name = 'Week 1 - Day 1') as id, 1 as step_index, 'One small thing about us that made me smile this week.' as prompt_text
  union all select (select id from cs where name = 'Week 1 - Day 1'), 2, 'In a challenging moment, I still choose you because…'
  union all select (select id from cs where name = 'Week 1 - Day 1'), 3, 'One specific thing you did recently that made me feel chosen.'

  -- Day 2
  union all select (select id from cs where name = 'Week 1 - Day 2'), 1, 'Something small that happened this week that made me laugh.'
  union all select (select id from cs where name = 'Week 1 - Day 2'), 2, 'When do I feel most understood by you?'
  union all select (select id from cs where name = 'Week 1 - Day 2'), 3, 'One thing you did that made me feel secure.'

  -- Day 3
  union all select (select id from cs where name = 'Week 1 - Day 3'), 1, 'One thing I’m looking forward to sharing with you this week.'
  union all select (select id from cs where name = 'Week 1 - Day 3'), 2, 'In a moment of doubt, I feel chosen because…'
  union all select (select id from cs where name = 'Week 1 - Day 3'), 3, 'One small thing you did recently that made me feel loved or safe.'

  -- Day 4
  union all select (select id from cs where name = 'Week 1 - Day 4'), 1, 'A small moment this week I appreciated from you.'
  union all select (select id from cs where name = 'Week 1 - Day 4'), 2, 'Something you did this week that you might not realize stayed with me.'
  union all select (select id from cs where name = 'Week 1 - Day 4'), 3, 'One easy way I can show up next week (pick one): clearer plans / more affection / more words / more patience / more time.'

  -- Day 5
  union all select (select id from cs where name = 'Week 1 - Day 5'), 1, 'One thing that made me feel cared for this week.'
  union all select (select id from cs where name = 'Week 1 - Day 5'), 2, 'One thing you could do that would help me feel more chosen.'
  union all select (select id from cs where name = 'Week 1 - Day 5'), 3, 'I’m sharing this with you because it helps me feel loved when…'

  -- Day 6
  union all select (select id from cs where name = 'Week 1 - Day 6'), 1, 'A memory of us that made me smile or laugh.'
  union all select (select id from cs where name = 'Week 1 - Day 6'), 2, 'Something you do that makes me feel closest to you.'
  union all select (select id from cs where name = 'Week 1 - Day 6'), 3, 'Send a short message: “One thing I love about you is…”'

  -- Weekly Reset
  union all select (select id from cs where name = 'Week 1 - Weekly Reset'), 1, 'What went well between us this week?'
  union all select (select id from cs where name = 'Week 1 - Weekly Reset'), 2, 'Was there a moment that felt heavy or distant?'
  union all select (select id from cs where name = 'Week 1 - Weekly Reset'), 3, 'What helped me feel closest to you?'
  union all select (select id from cs where name = 'Week 1 - Weekly Reset'), 4, 'What do you need more of next week?'
  union all select (select id from cs where name = 'Week 1 - Weekly Reset'), 5, 'One appreciation for you.'
  union all select (select id from cs where name = 'Week 1 - Weekly Reset'), 6, 'One intention I’m choosing for us next week.'
) p;
