# AGENTS.md — AQOON implementation map

Read `BRAND.md` and `CLAUDE.md` before UI changes. Do not modify Pilke campaign pages unless the owner explicitly asks.

## Family intake + lead tracker

This is the current production architecture. Do not reintroduce the old WhatsApp parser/localStorage tracker or direct browser database writes.

### Parent-facing intake
- Route: `/caawi`
- File: `caawi/index.html`
- Audience: Somali-speaking families and adults in Finland
- Current flow: hero → phone + name → city → main need → optional child age → short explainer → broad subcategory → automatic final lead save.
- Phone/name are deliberately collected first. When the person taps `Sii wad`, the contact is saved through the public validated Edge Function `family-intake-contact` before the remaining questions.
- The final completed request is saved through `family-intake-submit` directly into `public.family_leads`.
- Anonymous funnel events go through `family-funnel-track`.
- The browser must not contain a Supabase database key or service-role key.

### Intake Edge Functions
Supabase project: `qxracwbsyfibcelasxbs`

- `family-intake-contact`: validates and normalizes name/phone + request/session/visitor IDs, then upserts `public.family_intake_contacts`. It also records the server-side `contact_saved` funnel event.
- `family-intake-submit`: validates the completed intake, deduplicates on `intake_request_id`, creates the `public.family_leads` row, marks the saved contact complete, and records the server-side `submit_success` event.
- `family-funnel-track`: accepts the allowlisted anonymous non-PII browser funnel events only.

These functions are intentionally public (`verify_jwt=false`) because the intake is public. Validation, field allowlists, RLS and service-role use stay server-side.

### Source-of-truth CRM table
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
- `analytics_session_id`, `analytics_visitor_id`, `intake_request_id`
- `referrer_host`, `utm_source`, `utm_medium`, `utm_campaign`
- `next_follow_up_at`, `urgency`, `interview_status`, `last_interview_at`, `journey_stage`

RLS is enabled. The application should use the validated Edge Functions rather than direct public table writes.

### Supporting private tables
- `public.family_intake_contacts`: early phone/name saves; no public read policy.
- `public.family_interviews`: structured first-call answers, summary, research prompt, urgency and follow-up; no public read policy.
- `public.partner_programs`: verified programme/partner registry; no public read policy.
- `public.family_funnel_events`: anonymous funnel events. Never put name or phone in this table.

### Private Command Center
- Route: `/tracker`
- Files: `tracker/index.html`, `tracker/app.css`, `tracker/app.js`
- Data comes live from Supabase. No family lead database is stored in browser localStorage.
- Password is entered by the operator and kept only in `sessionStorage` for the current browser session.
- The public repo does NOT contain the tracker plaintext password.
- Dashboard: compact action view with 48-hour first-contact SLA.
- Family CRM: lead cards, contact status, journey stage, first interview, follow-up scheduling and research brief generation.
- Analytics: traffic, current phone-first funnel, leaks, sources, needs, cities and anonymous journey diagnostics.

Admin API is Supabase Edge Function:
- Function slug: `family-leads-admin`
- Endpoint: `https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-leads-admin`
- Custom password auth via `x-tracker-password`
- Uses Supabase's server-side service-role environment key.
- Current actions include `ping`, `list`, `update`, `analytics`, `programs`/`programmes`, and `save_interview`/`interview_save`.

### Analytics definitions
Do not mix units in the UI:
- visitor = distinct anonymous browser visitor ID
- session = distinct visit/session ID
- page view = `page_view` event
- current funnel = distinct sessions in the current phone-first cohort
- CRM lead = actual row in `family_leads`

A completed session and a CRM lead row are related but are not interchangeable metrics. Historical traffic before a form-version change must not silently be mixed into the current conversion funnel.

### Security rules
- Never put the Supabase service-role key in GitHub, HTML, frontend JS, or Vercel public variables.
- Never expose family phone numbers through an unauthenticated read endpoint.
- Do not put the tracker plaintext password in this repository or documentation.
- Keep `/tracker` `noindex,nofollow,noarchive` and `Disallow: /tracker` in `robots.txt`.
- Do not store name, phone, free-text interview answers or other family PII in anonymous analytics.
- Keep public intake payloads strictly validated server-side.
- Treat files under `internal/` as non-secret documentation because this GitHub repository is public. Never place passwords, family PII, private email threads or confidential buyer data there.

### Legacy compatibility
- `waitlist` and `trg_sync_family_intake_to_family_leads` exist for old/legacy submissions only. The current `/caawi` flow does not use them.
- The retired browser-local WhatsApp parser/localStorage tracker must not be restored.

### Production URLs
- Parent intake: `https://aqoon.live/caawi`
- Somali support hub: `https://aqoon.live/so`
- Current opportunities: `https://aqoon.live/so/ajankohtaiset`
- Private tracker: `https://aqoon.live/tracker`
