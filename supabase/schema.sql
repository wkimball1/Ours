-- Ours v1 schema
create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key,
  first_name text,
  timezone text not null default 'America/New_York',
  created_at timestamptz not null default now()
);

create table if not exists couples (
  id uuid primary key default gen_random_uuid(),
  member1 uuid not null references profiles(id) on delete cascade,
  member2 uuid references profiles(id) on delete set null,
  relationship_start_date date,
  next_visit_date date,
  created_at timestamptz not null default now()
);

create table if not exists invites (
  token text primary key,
  couple_id uuid not null references couples(id) on delete cascade,
  created_by uuid not null references profiles(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz
);

create table if not exists content_sets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('daily','weekly')),
  day_index int,
  is_active boolean not null default true
);

create table if not exists prompts (
  id uuid primary key default gen_random_uuid(),
  content_set_id uuid not null references content_sets(id) on delete cascade,
  step_index int not null,
  title text,
  prompt_text text not null
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  type text not null check (type in ('daily','weekly')),
  session_date date,
  week_start_date date,
  content_set_id uuid not null references content_sets(id),
  status text not null default 'open' check (status in ('open','locked','unlocked')),
  created_at timestamptz not null default now()
);

create table if not exists responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  step_index int not null,
  response_text text,
  created_at timestamptz not null default now(),
  unique (session_id, user_id, step_index)
);

create table if not exists moods (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  mood_level int not null check (mood_level between 0 and 100),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  to_user_id uuid not null references profiles(id) on delete cascade,
  from_user_id uuid references profiles(id) on delete set null,
  type text not null check (type in ('reassurance_request','reassurance_message','system')),
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists waitlist_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  first_name text,
  partner_email text,
  source text not null default 'unknown',
  created_at timestamptz not null default now()
);

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  event_name text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace view v_user_couples as
select c.*
from couples c
where c.member1 = auth.uid() or c.member2 = auth.uid();

alter table profiles enable row level security;
alter table couples enable row level security;
alter table invites enable row level security;
alter table content_sets enable row level security;
alter table prompts enable row level security;
alter table sessions enable row level security;
alter table responses enable row level security;
alter table moods enable row level security;
alter table notifications enable row level security;
alter table waitlist_leads enable row level security;
alter table analytics_events enable row level security;

-- Profiles
create policy if not exists profiles_self_read on profiles for select using (id = auth.uid());
create policy if not exists profiles_self_write on profiles for all using (id = auth.uid()) with check (id = auth.uid());

-- Couples
create policy if not exists couples_member_read on couples for select using (member1 = auth.uid() or member2 = auth.uid());
create policy if not exists couples_member_update on couples for update using (member1 = auth.uid() or member2 = auth.uid());
create policy if not exists couples_member_insert on couples for insert with check (member1 = auth.uid() or member2 = auth.uid());

-- Invites
create policy if not exists invites_member_read on invites for select using (
  exists (select 1 from couples c where c.id = invites.couple_id and (c.member1 = auth.uid() or c.member2 = auth.uid()))
);
create policy if not exists invites_member_write on invites for all using (
  exists (select 1 from couples c where c.id = invites.couple_id and (c.member1 = auth.uid() or c.member2 = auth.uid()))
) with check (
  exists (select 1 from couples c where c.id = invites.couple_id and (c.member1 = auth.uid() or c.member2 = auth.uid()))
);

-- Content (read-only to authenticated users)
create policy if not exists content_sets_auth_read on content_sets for select to authenticated using (true);
create policy if not exists prompts_auth_read on prompts for select to authenticated using (true);

-- Sessions
create policy if not exists sessions_member_access on sessions for all using (
  exists (select 1 from couples c where c.id = sessions.couple_id and (c.member1 = auth.uid() or c.member2 = auth.uid()))
) with check (
  exists (select 1 from couples c where c.id = sessions.couple_id and (c.member1 = auth.uid() or c.member2 = auth.uid()))
);

-- Responses
create policy if not exists responses_member_access on responses for all using (
  exists (
    select 1
    from sessions s
    join couples c on c.id = s.couple_id
    where s.id = responses.session_id and (c.member1 = auth.uid() or c.member2 = auth.uid())
  )
) with check (
  exists (
    select 1
    from sessions s
    join couples c on c.id = s.couple_id
    where s.id = responses.session_id and (c.member1 = auth.uid() or c.member2 = auth.uid())
  )
);

-- Moods
create policy if not exists moods_member_access on moods for all using (
  exists (select 1 from couples c where c.id = moods.couple_id and (c.member1 = auth.uid() or c.member2 = auth.uid()))
) with check (
  exists (select 1 from couples c where c.id = moods.couple_id and (c.member1 = auth.uid() or c.member2 = auth.uid()))
);

-- Notifications (strict recipient visibility)
create policy if not exists notifications_recipient_read on notifications for select using (to_user_id = auth.uid());
create policy if not exists notifications_recipient_update on notifications for update using (to_user_id = auth.uid());
create policy if not exists notifications_member_insert on notifications for insert with check (
  exists (select 1 from couples c where c.id = notifications.couple_id and (c.member1 = auth.uid() or c.member2 = auth.uid()))
);

-- Waitlist + analytics (service role primarily, app can insert minimal rows)
create policy if not exists waitlist_public_insert on waitlist_leads for insert with check (true);
create policy if not exists analytics_auth_insert on analytics_events for insert with check (auth.uid() is not null or user_id is null);

-- Invite accept RPC (bypasses RLS safely via token validation)
create or replace function public.accept_invite(invite_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_couple_id uuid;
  v_member2 uuid;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select i.couple_id into v_couple_id
  from invites i
  where i.token = invite_token
    and i.used_at is null
    and i.expires_at > now();

  if v_couple_id is null then
    raise exception 'Invite invalid or expired';
  end if;

  select c.member2 into v_member2
  from couples c
  where c.id = v_couple_id
  for update;

  if v_member2 is not null and v_member2 <> v_user_id then
    raise exception 'Invite already claimed';
  end if;

  update couples
  set member2 = v_user_id
  where id = v_couple_id
    and (member2 is null or member2 = v_user_id);

  update invites
  set used_at = now()
  where token = invite_token
    and used_at is null;

  return v_couple_id;
end;
$$;

grant execute on function public.accept_invite(text) to authenticated;
