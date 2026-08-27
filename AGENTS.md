# AGENTS.md — AQOON agent navigation map

Start with `CONTEXT.md`, then read the nearest folder `CONTEXT.md`. Load only the context needed for the task.

## Runtime map

- `/` + `tapaus/`, `menetelma/`, `paketit/` — B2B public site
- `/caawi` — public Somali intake, see `caawi/CONTEXT.md`
- `/tracker` — private operator command center, see `tracker/CONTEXT.md`
- `/so` — Somali public guidance, see `so/CONTEXT.md`
- `/pilke` and `/pilke/so` — protected campaign pages; do not modify unless explicitly asked

## Knowledge map

- `knowledge/CONTEXT.md` — canonical truth rules
- `knowledge/schemas/` — source/service/programme contracts
- `knowledge/canonical/` — durable reviewed facts
- `knowledge/link-bank/` — official links, calculators and tools
- `knowledge/language/` — terminology and language decisions
- `research/CONTEXT.md` — verification workflow
- `references/CONTEXT.md` — source artifacts, not canonical truth
- `working/CONTEXT.md` — disposable audits/extractions/drafts
- `operations/QA.md` — release QA and deploy verification

## Family intake + CRM architecture

Supabase project: `qxracwbsyfibcelasxbs`.

Current public intake uses:

- `family-intake-contact` for validated early phone/name save
- `family-intake-submit` for validated final lead creation/deduplication
- `family-funnel-track` for allowlisted anonymous non-PII events

Source-of-truth CRM table: `public.family_leads`.

Supporting private tables include `family_intake_contacts`, `family_interviews`, `partner_programs` and `family_funnel_events`.

Private admin API: `family-leads-admin` Edge Function. Tracker password is entered by the operator and must never exist in this repository.

## Metrics contract

Do not mix:

- visitor = anonymous browser visitor
- session = visit/session
- page view = `page_view`
- current funnel = distinct sessions in the active form cohort
- CRM lead = row in `family_leads`

## Security contract

- no service-role key in frontend/GitHub
- no public family-data read endpoint
- no family PII in anonymous analytics
- `/tracker` stays noindex/nofollow/noarchive and blocked in robots
- public intake payloads are validated server-side
- this entire GitHub repo is public, including documentation folders

## Knowledge contract

Existing AQOON text is not evidence. Current programme, deadline, benefit, eligibility, fee, service-name and procedure claims require live official-source verification before reuse.

Pages render knowledge; they do not own it. Update the canonical record first when a durable fact changes.

## Release contract

For substantial work follow:

discover → map → define → scaffold → migrate/audit → live-source verify → expand → content QA → implementation QA → publish.

Large Finland-wide knowledge releases require the three content audit lenses in `operations/QA.md`, then production verification against the exact Git commit.
