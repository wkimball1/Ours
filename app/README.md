# Ours App (Next.js + Supabase)

## Stack
- Next.js App Router + TypeScript + Tailwind
- Supabase Auth + Postgres + RLS

## Setup
1. Copy `.env.example` to `.env.local`
2. Fill:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Optional dev setting to avoid auth email throttling:
   - `NEXT_PUBLIC_ENABLE_MAGIC_LINKS=false`
4. Add `SUPABASE_SERVICE_ROLE_KEY` for local admin scripts (optional, dev only).
5. In Supabase SQL editor, run:
   - `../supabase/schema.sql`
   - `../supabase/seed_week1.sql`
6. (Optional) seed two reusable QA users:

```bash
npm run seed:test-users
```

7. Start app:

```bash
npm install
npm run dev
```

## Routes
- `/` landing
- `/login`, `/signup`, `/invite/[token]`
- `/app` home dashboard
- `/app/daily`
- `/app/weekly`
- `/app/reassurance`
- `/app/settings`

## MVP notes
- In-app notifications only (no push)
- No streak shaming
- Unlock copy: "You both chose to show up today."
