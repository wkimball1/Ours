# Prompt for AI Builder

Build a web app called **Ours** with tagline **"Stay close. Even when apart."**

Core tone: calm, grounding, warm, intimate for all genders. Avoid cheesy language, avoid guilt or streak shaming.
Primary emotional outcome: users feel chosen.

Audience v1: long-distance couples with busy schedules/time zones.

Implement ONLY MVP:
- Auth (email/password or magic link), profile (first name, timezone)
- Couple pairing with invite token link
- Home dashboard with next-visit countdown (optional), Today’s Moment, partner status, reassurance button, gentle connection rhythm
- Daily Moment: 3-step async flow, unlock responses when both complete
- Weekly Reset: 6-step flow, open weekly window, same unlock logic
- Reassurance: mood slider, request reassurance, quick templates, in-app notifications only

Exclude from v1:
- games, AI insights, punitive streaks, full chat replacement, video calling, complex analytics

Routes:
- /, /login, /signup, /invite/[token]
- /app, /app/daily, /app/weekly, /app/reassurance, /app/settings

Use Next.js (App Router, TS), Tailwind, Supabase Auth + Postgres + RLS.

RLS: users can access couple/session/response rows only if they are member1/member2 of that couple. Notifications must be restricted to to_user_id = auth.uid().

Session generation:
- ensure daily session exists for today on app load
- ensure weekly session exists for current week (Monday week_start_date)

Use invitational UI copy examples:
- "When you’re ready"
- "A moment for Ours is waiting"
- "No rush"
- Unlock success: "You both chose to show up today."
