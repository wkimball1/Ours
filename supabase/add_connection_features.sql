-- Connection features: Shared Journal

create table if not exists journal_entries (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table journal_entries enable row level security;

do $$ begin
  drop policy if exists journal_entries_read on journal_entries;
  drop policy if exists journal_entries_write on journal_entries;
end $$;

create policy journal_entries_read on journal_entries for select using (
  exists (select 1 from couples c where c.id = journal_entries.couple_id and (c.member1 = auth.uid() or c.member2 = auth.uid()))
);
create policy journal_entries_write on journal_entries for insert with check (
  user_id = auth.uid() and
  exists (select 1 from couples c where c.id = journal_entries.couple_id and (c.member1 = auth.uid() or c.member2 = auth.uid()))
);
