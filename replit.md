# Ours — Replit Project

A calm connection app for long-distance couples. Built with Next.js and Supabase.

## Architecture

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Auth & Database**: Supabase (`@supabase/ssr`)
- **Styling**: Tailwind CSS v4
- **App directory**: `app/` (subdirectory — all Next.js code lives here)

## Running the App

The workflow command is: `cd app && npm run dev`

This starts the dev server on port 5000 (required for Replit's preview pane).

## Required Environment Variables

These must be set as Replit secrets:

- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your Supabase anonymous/public key

## Key Files

- `app/src/app/` — Next.js App Router pages
- `app/src/middleware.ts` — Auth guard (redirects unauthenticated users away from `/app/*`)
- `app/src/lib/supabase/server.ts` — Server-side Supabase client
- `app/src/lib/supabase/client.ts` — Client-side Supabase client
- `app/src/app/actions.ts` — Server actions
- `app/src/components/` — Shared UI components

## Features

### Core (existing)
- Auth (email/password), couple pairing via invite links
- Daily Moment (3-step async unlock), Weekly Reset (6-step)
- Reassurance (mood tracker, care requests, comfort templates)
- Settings (name, timezone, visit date)

### Fun Features (new)
- **Would You Rather** (`/app/games/would-you-rather`) — Daily question, async reveal when both answer
- **Draw Together** (`/app/games/draw`) — Daily drawing prompt, canvas with colors/brushes, async reveal
- **This or That** (`/app/games/this-or-that`) — Quick binary picks with compatibility score
- **Love Notes** (`/app/love-notes`) — Leave surprise notes for partner, unread tracking

### Connection Features (new)
- **Shared Journal** (`/app/journal`) — Free-form entries from both partners, chronological feed
- **Memories Timeline** (`/app/memories`) — Reverse-chronological archive of all shared moments, drawings, game results, love notes
- **Milestones** (`/app/milestones`) — Achievement cards computed from real data (days together, shared moments, notes sent, etc.)

### Navigation
- Desktop: Full nav bar in header (Home, Daily, Weekly, Games, Notes, Journal, Memories + gear dropdown with Milestones, Reassurance, Settings)
- Mobile: Bottom tab bar (Home, Daily, Weekly, Games, More); More links to `/app/more` page
- Games hub at `/app/games` links to all three game types
- Unread love notes badge on Notes (desktop) and More (mobile) nav items

### Polish Features
- **Color themes**: 8 themes (Classic, Rose, Lavender, Ocean, Sunset, Forest, Berry, Midnight) stored in localStorage, applied via `data-theme` on `<html>`. **Important**: CSS variables (`var(--accent)`) do NOT work in Tailwind v4 arbitrary values or inline styles in this project. All accent colors use hardcoded hex values — either via `[data-theme] .btn-accent` / `.text-accent` selectors in `globals.css`, or via JS color maps in client components (`AccentButton`, `HeroCard`, `ThemePicker`). Never use `var(--accent)` in component code. Theme picker in Settings.
- **Partner presence**: `last_active_at` tracked on `profiles`, shown as "Active now" / "Last seen Xm ago" in home hero
- **Visit countdown**: Enhanced visuals when ≤7 days away (amber emphasis, "almost there!" messaging)
- **Journal delete**: Users can delete their own journal entries
- **Unread badges**: Red badge on Notes nav (desktop count, mobile dot) for unread love notes
- **Warm empty states**: All empty states (journal, notes, memories, milestones, visit date) have invitational copy
- **Better onboarding**: No developer-facing SQL/migration references visible to users
- **Account management**: Settings page has password change and account deletion

## Database Migrations

- `supabase/schema.sql` — Core tables (profiles, couples, sessions, etc.)
- `supabase/seed_week1.sql` — Week 1 daily/weekly prompt content
- `supabase/add_fun_features.sql` — Tables for games and love notes with seed data
- `supabase/add_connection_features.sql` — Journal entries table with RLS
- `supabase/add_partner_guesses.sql` — Partner guess column on game answer tables
- `supabase/add_polish.sql` — `last_active_at` column on profiles

## Notes

- Auth redirects: unauthenticated → `/login`, authenticated on login/signup → `/app`
- All game/note/journal features use RLS policies scoped to couple membership
- Drawing canvas supports touch (mobile) and mouse (desktop)
- Design tone: warm, calm, non-cheesy. Invitational language ("When you're ready", "No rush").
