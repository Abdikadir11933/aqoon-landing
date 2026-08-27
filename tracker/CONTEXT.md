# `/tracker` context

Purpose: private AQOON operator command center for following family leads, first-contact SLA, structured interviews, follow-ups, programme matching and anonymous funnel analytics.

## Security boundary

- `/tracker` must remain `noindex,nofollow,noarchive` and disallowed in `robots.txt`.
- Family data comes live from protected Supabase-backed APIs.
- Tracker password is never committed to GitHub.
- Browser session may keep the entered password in `sessionStorage` only.
- Never expose family phone numbers or interview answers through an unauthenticated read endpoint.
- Do not restore the retired localStorage/WhatsApp-parser lead database.

## Metric contract

Never mix these units:

- visitor = anonymous visitor id
- session = visit/session id
- page view = page_view event
- current funnel = distinct sessions for the active form cohort
- CRM lead = row in `family_leads`

A completed funnel session and a CRM lead are related but not interchangeable.

## Knowledge dependencies

The tracker may help an operator match a family to services/programmes, but programme cards and eligibility clues are not authority decisions. Matching logic must distinguish:

1. facts collected from the family,
2. official criteria verified in `knowledge/`,
3. operator hypotheses to verify,
4. final authority/provider decisions that AQOON cannot make.

## Interview contract

The first call should collect only the facts needed to choose the next 1–3 routes. Keep reusable interview guidance canonical under `knowledge/canonical/intake/`.

## QA before publish

- auth still blocks private data
- lead list/update actions work
- first interview save works
- follow-up scheduling works
- analytics units remain correctly labelled
- no PII enters anonymous analytics
- no historical form cohort is silently mixed into the current conversion funnel
- `/tracker` remains `no-store`
