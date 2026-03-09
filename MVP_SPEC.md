# Ours — MVP Spec

## Must-have features
1. Auth (email/password or magic link), basic profile (first name, timezone)
2. Couple pairing via invite token link
3. Home dashboard:
   - optional next-visit countdown
   - Today’s Moment
   - partner status (waiting on you/them/unlocked)
   - Reassurance button
   - gentle connection rhythm
4. Daily Moment (3 steps, async unlock once both finish)
5. Weekly Reset (6 prompts, flexible window, async unlock)
6. Reassurance tools:
   - mood slider
   - reassurance request
   - quick reassurance templates
   - in-app notifications only

## Explicitly excluded (v1)
- Games
- AI insights / love-language detection
- Punitive streak systems
- Full chat replacement
- Video calling
- Complex analytics

## UX tone rules
- Warm, calm, grounding, non-cheesy
- Invitational language (e.g., "When you’re ready")
- No guilt language (e.g., "You missed yesterday")
- Subtle chosen framing (e.g., "You both chose to show up today")

## Routes
Public:
- /
- /login
- /signup
- /invite/[token]

Authenticated:
- /app
- /app/daily
- /app/weekly
- /app/reassurance
- /app/settings

## Core flows
### A) Create + invite
1) Signup
2) Create couple (member1)
3) Generate invite token
4) Partner opens /invite/[token], signs up/logs in
5) Accept invite, fill member2, invalidate token
6) Redirect to /app

### B) Daily Moment
1) Open /app/daily
2) Complete 3-step guided flow
3) Save each step, submit
4) Wait state until partner complete
5) Unlock both responses when both complete

### C) Weekly Reset
Same unlock mechanic as Daily, 6 prompts, open weekly window

### D) Reassurance
1) Set mood slider
2) Optional reassurance request
3) Partner sees in-app notification and sends template/custom reassurance

## Stack
- Next.js App Router + TypeScript + Tailwind
- Supabase Auth + Postgres + RLS
- Vercel deploy

## Session generation rules
- Ensure a daily session exists for today on /app load
- Ensure one weekly session exists for current week window

## Notification rules
- In-app only in v1
- Push later in mobile phase
