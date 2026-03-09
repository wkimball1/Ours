# Growth Tracking (First 100 Users)

## Funnel events (analytics_events)
- `waitlist_joined`
  - metadata: `source`, `utm_*`, `partner_email_provided`
- `signup_completed`
  - metadata: `source`, `utm_*`, `invite_token_present`
- `login_completed`
  - metadata: `source`, `utm_*`, `invite_token_present`
- `partner_invite_sent`
- `partner_connected`
  - metadata: `source`, `utm_*`, `token_prefix`

## Source propagation implemented
- Landing CTA -> `source=landing_hero`
- Challenge query params -> hidden fields -> waitlist + analytics
- Invite link path -> signup/login with `invite` + source + utm
- Signup/login with invite token redirect back to invite accept flow

## Weekly checks
1. Source-level conversion: waitlist -> signup
2. Invite completion rate: signup with invite token -> partner_connected
3. Time-to-connect: signup_completed to partner_connected (median)
