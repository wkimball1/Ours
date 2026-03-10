-- Polish: add last_active_at to profiles for partner presence

alter table profiles add column if not exists last_active_at timestamptz;

-- Allow users to read their partner's basic profile info (name + last_active_at)
create policy "profiles_partner_read" on profiles for select using (
  exists (
    select 1 from couples
    where (couples.member1 = auth.uid() and couples.member2 = profiles.id)
       or (couples.member2 = auth.uid() and couples.member1 = profiles.id)
  )
);

-- Allow users to delete their own journal entries
create policy "journal_entries_delete_own" on journal_entries for delete using (
  user_id = auth.uid()
);
