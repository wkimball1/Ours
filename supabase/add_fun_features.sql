-- Fun features: Would You Rather, Draw Together, This or That, Love Notes

-- Would You Rather questions (global pool)
create table if not exists would_you_rather_questions (
  id uuid primary key default gen_random_uuid(),
  question_a text not null,
  question_b text not null,
  day_index int not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Would You Rather answers (per couple per question)
create table if not exists would_you_rather_answers (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  question_id uuid not null references would_you_rather_questions(id) on delete cascade,
  choice text not null check (choice in ('a', 'b')),
  created_at timestamptz not null default now(),
  unique (couple_id, user_id, question_id)
);

-- Drawing prompts (global pool)
create table if not exists drawing_prompts (
  id uuid primary key default gen_random_uuid(),
  prompt_text text not null,
  day_index int not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Drawings (per couple per day)
create table if not exists drawings (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  prompt_id uuid not null references drawing_prompts(id) on delete cascade,
  drawing_data text not null,
  session_date date not null default current_date,
  created_at timestamptz not null default now(),
  unique (couple_id, user_id, session_date)
);

-- This or That questions (global pool)
create table if not exists this_or_that_questions (
  id uuid primary key default gen_random_uuid(),
  option_a text not null,
  option_b text not null,
  category text not null default 'general',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- This or That answers
create table if not exists this_or_that_answers (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  question_id uuid not null references this_or_that_questions(id) on delete cascade,
  choice text not null check (choice in ('a', 'b')),
  created_at timestamptz not null default now(),
  unique (couple_id, user_id, question_id)
);

-- Love Notes
create table if not exists love_notes (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  from_user_id uuid not null references profiles(id) on delete cascade,
  to_user_id uuid not null references profiles(id) on delete cascade,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Enable RLS on all new tables
alter table would_you_rather_questions enable row level security;
alter table would_you_rather_answers enable row level security;
alter table drawing_prompts enable row level security;
alter table drawings enable row level security;
alter table this_or_that_questions enable row level security;
alter table this_or_that_answers enable row level security;
alter table love_notes enable row level security;

-- RLS: Questions are readable by all authenticated users
do $$ begin
  drop policy if exists wyr_questions_read on would_you_rather_questions;
  drop policy if exists drawing_prompts_read on drawing_prompts;
  drop policy if exists tot_questions_read on this_or_that_questions;

  drop policy if exists wyr_answers_read on would_you_rather_answers;
  drop policy if exists wyr_answers_write on would_you_rather_answers;
  drop policy if exists wyr_answers_update on would_you_rather_answers;

  drop policy if exists drawings_read on drawings;
  drop policy if exists drawings_write on drawings;
  drop policy if exists drawings_update on drawings;

  drop policy if exists tot_answers_read on this_or_that_answers;
  drop policy if exists tot_answers_write on this_or_that_answers;
  drop policy if exists tot_answers_update on this_or_that_answers;

  drop policy if exists love_notes_read on love_notes;
  drop policy if exists love_notes_insert on love_notes;
  drop policy if exists love_notes_update on love_notes;
end $$;

create policy wyr_questions_read on would_you_rather_questions for select to authenticated using (true);
create policy drawing_prompts_read on drawing_prompts for select to authenticated using (true);
create policy tot_questions_read on this_or_that_questions for select to authenticated using (true);

-- RLS: Answers — read by couple members, write only own rows
create policy wyr_answers_read on would_you_rather_answers for select using (
  exists (select 1 from couples c where c.id = would_you_rather_answers.couple_id and (c.member1 = auth.uid() or c.member2 = auth.uid()))
);
create policy wyr_answers_write on would_you_rather_answers for insert with check (
  user_id = auth.uid() and
  exists (select 1 from couples c where c.id = would_you_rather_answers.couple_id and (c.member1 = auth.uid() or c.member2 = auth.uid()))
);
create policy wyr_answers_update on would_you_rather_answers for update using (user_id = auth.uid());

create policy drawings_read on drawings for select using (
  exists (select 1 from couples c where c.id = drawings.couple_id and (c.member1 = auth.uid() or c.member2 = auth.uid()))
);
create policy drawings_write on drawings for insert with check (
  user_id = auth.uid() and
  exists (select 1 from couples c where c.id = drawings.couple_id and (c.member1 = auth.uid() or c.member2 = auth.uid()))
);
create policy drawings_update on drawings for update using (user_id = auth.uid());

create policy tot_answers_read on this_or_that_answers for select using (
  exists (select 1 from couples c where c.id = this_or_that_answers.couple_id and (c.member1 = auth.uid() or c.member2 = auth.uid()))
);
create policy tot_answers_write on this_or_that_answers for insert with check (
  user_id = auth.uid() and
  exists (select 1 from couples c where c.id = this_or_that_answers.couple_id and (c.member1 = auth.uid() or c.member2 = auth.uid()))
);
create policy tot_answers_update on this_or_that_answers for update using (user_id = auth.uid());

-- Love Notes — sender must be auth.uid(), both users must be in the couple
create policy love_notes_read on love_notes for select using (
  from_user_id = auth.uid() or to_user_id = auth.uid()
);
create policy love_notes_insert on love_notes for insert with check (
  from_user_id = auth.uid() and
  exists (
    select 1 from couples c where c.id = love_notes.couple_id
    and (c.member1 = auth.uid() or c.member2 = auth.uid())
    and (c.member1 = love_notes.to_user_id or c.member2 = love_notes.to_user_id)
  )
);
create policy love_notes_update on love_notes for update using (to_user_id = auth.uid());

-- Seed Would You Rather questions
insert into would_you_rather_questions (question_a, question_b, day_index) values
  ('Live together in a tiny cabin in the mountains', 'Live together in a cozy apartment by the ocean', 1),
  ('Cook dinner together every night', 'Go out to eat together every night', 2),
  ('Have the power to pause time together', 'Have the power to teleport to each other instantly', 3),
  ('Relive our first date', 'Fast-forward to our next visit', 4),
  ('Always know what the other is feeling', 'Always know how to make the other smile', 5),
  ('Take a spontaneous road trip right now', 'Plan the perfect vacation for next month', 6),
  ('Spend a rainy day cuddling inside', 'Spend a sunny day exploring outside', 7),
  ('Receive a handwritten love letter', 'Receive a surprise care package', 8),
  ('Have breakfast in bed together', 'Have a midnight snack together', 9),
  ('Dance in the kitchen together', 'Stargaze on a blanket together', 10),
  ('Share one dream every night', 'Share one superpower for a day', 11),
  ('Watch the sunrise together', 'Watch the sunset together', 12),
  ('Have a movie marathon weekend', 'Have an adventure-packed weekend', 13),
  ('Read each other''s minds for a day', 'Swap lives for a day', 14);

-- Seed Drawing prompts
insert into drawing_prompts (prompt_text, day_index) values
  ('Draw your mood right now', 1),
  ('Draw what you had for your last meal', 2),
  ('Draw your favorite place to be together', 3),
  ('Draw what you wish you were doing right now', 4),
  ('Draw your partner from memory', 5),
  ('Draw your dream date night', 6),
  ('Draw something that made you smile today', 7),
  ('Draw your happy place', 8),
  ('Draw what love looks like to you', 9),
  ('Draw your favorite shared memory', 10),
  ('Draw where you want to travel together', 11),
  ('Draw your morning routine', 12),
  ('Draw something cozy', 13),
  ('Draw a gift you''d love to give your partner', 14);

-- Seed This or That questions
insert into this_or_that_questions (option_a, option_b, category) values
  ('Morning person', 'Night owl', 'lifestyle'),
  ('Beach vacation', 'Mountain getaway', 'travel'),
  ('Sweet snacks', 'Savory snacks', 'food'),
  ('Text messages', 'Voice calls', 'communication'),
  ('Big party', 'Quiet night in', 'social'),
  ('Summer', 'Winter', 'seasons'),
  ('Dogs', 'Cats', 'animals'),
  ('Books', 'Movies', 'entertainment'),
  ('Coffee', 'Tea', 'drinks'),
  ('City life', 'Country life', 'lifestyle'),
  ('Cooking at home', 'Eating out', 'food'),
  ('Early bird', 'Sleeping in', 'lifestyle'),
  ('Adventure', 'Relaxation', 'travel'),
  ('Sunset', 'Sunrise', 'nature'),
  ('Handwritten note', 'Surprise gift', 'romance'),
  ('Road trip', 'Flight', 'travel'),
  ('Rainy days', 'Sunny days', 'weather'),
  ('Comedy', 'Drama', 'entertainment'),
  ('Spontaneous plans', 'Planned itinerary', 'lifestyle'),
  ('Hold hands', 'Arm around shoulder', 'romance');
