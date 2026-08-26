# AGENTS.md — AQOON implementation map

Read `BRAND.md` and `CLAUDE.md` before UI changes.

## Family intake + lead tracker

This is the current production architecture. Do not reintroduce the old WhatsApp parser/localStorage tracker.

### Parent-facing intake
- Route: `/caawi`
- File: `caawi/index.html`
- Audience: Somali-speaking families
- Flow: city → main need → optional child age → explainer → broad subcategory → name + phone → submit
- Current compatibility path: `/caawi` still inserts `campaign = family-intake-v1` into `public.waitlist`.
- Database trigger `trg_sync_family_intake_to_family_leads` immediately copies those rows into `public.family_leads`.
- The trigger exists to keep the live form stable. New lead/admin work should use `public.family_leads` as the source of truth.

### Source-of-truth table
Supabase project: `qxracwbsyfibcelasxbs`
Table: `public.family_leads`

Important columns:
- `id`
- `created_at`, `updated_at`
- `name`, `phone`, `city`
- `main_need`, `sub_need`, `age_group`
- `tier` (`1` or `2`)
- `status` (`new`, `contacted`, `resolved`)
- `contacted_at`, `resolved_at`
- `notes`
- `source`, `lang`
- `legacy_waitlist_id`

RLS is enabled. Public/anon clients can INSERT qualifying new leads only. They cannot SELECT family records.

### Private Command Center
- Route: `/tracker`
- File: `tracker/index.html`
- Data comes live from Supabase. No family lead database is stored in localStorage.
- Password is entered by the operator and kept only in `sessionStorage` for the current browser session.
- The public repo does NOT contain the tracker password.

Admin API is Supabase Edge Function:
- Function slug: `family-leads-admin`
- Endpoint: `https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-leads-admin`
- Custom password auth via `x-tracker-password`
- The function holds only a SHA-256 password hash in its private deployed source and uses Supabase's server-side service-role environment key.
- Supported actions: `ping`, `list`, `update`
- `update` is used for status, notes and limited lead edits.

### Security rules
- Never put the Supabase service-role key in GitHub, HTML, frontend JS, or Vercel public variables.
- Never grant public SELECT on `family_leads`.
- Never expose phone numbers through an unauthenticated endpoint.
- Do not put the tracker password in this repository or documentation.
- If changing the tracker password, update the hash inside the `family-leads-admin` Edge Function and give the new plaintext password only to the owner.
- Keep `/tracker` `noindex,nofollow,noarchive`.

### Legacy behavior to avoid
The original tracker parsed structured WhatsApp messages and stored leads in browser localStorage. That architecture is retired. Do not restore it unless explicitly requested.

### Production URLs
- Parent intake: `https://aqoon.live/caawi`
- Private tracker: `https://aqoon.live/tracker`
