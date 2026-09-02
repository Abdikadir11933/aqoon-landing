# AQOON family-system end-to-end testing

Use this skill for `/caawi`, family intake, private `/tracker`, family Edge Functions and their connected Supabase data flows. It does not authorise production mutations, creation of real-looking test people or access beyond the current operator's permissions.

## Current boundaries

- `/caawi` is the canonical Somali family surface; `/so/*` is redirect compatibility only.
- `/tracker` uses Supabase Auth email and password linked to an active, approved `operators` row. There is no shared password or fallback.
- Anonymous funnel events and identifiable CRM records are different datasets and must not be treated as one cohort without an explicit join contract.
- The public journey and the more granular internal workflow must be mapped explicitly. Never call a view, click, share, saved phone number or interview an outcome.
- Use synthetic records only in an authorised non-production environment. If production testing is explicitly authorised, use an unmistakable `TEST-` label, a reserved test contact method and a documented cleanup plan. Never invent a plausible Finnish phone number.

## Before testing

1. Read root `CLAUDE.md` and `CONTEXT.md`, then `caawi/CONTEXT.md`, `tracker/CONTEXT.md`, `workspaces/product-qa/CONTEXT.md` and the relevant Edge Function source.
2. Inspect `git status`, deployment configuration and the actual scripts loaded by `tracker/index.html`.
3. Run the static baseline:
   - `python scripts/repo_integrity_qa.py`
   - `python scripts/site_qa.py`
   - `python scripts/check_seo_metadata.py`
   - `python scripts/usability_qa.py`
   - `python scripts/legal_trust_qa.py`
   - `node --test tests/*.test.js`
   - `node scripts/tracker_collection_qa.js`
4. Record environment, commit, timestamp and whether the test is read-only or mutating.

## Journey checks

### Family discovery and intake

- Canonical `/caawi` and topic pages load without console errors or broken internal links.
- Somali title, description, canonical URL, language, source/date and CTA are correct.
- Name/phone-first recovery, consent choices and the `Maya` path are understandable and keyboard accessible.
- `referrer_host`, `utm_source`, `utm_medium` and `utm_campaign` preserve supplied attribution without inventing missing values.
- Analytics fires only with the required consent; PII never enters analytics payloads or URLs.
- Retries are idempotent and do not create duplicate leads or events.

### Intake to CRM

- A valid intake creates the intended contact/lead records and a traceable event once.
- Partial intake remains recoverable under the documented retention rules.
- Category, municipality, language, source and consent values survive the API/database/UI round trip exactly.
- Error responses are safe, specific enough for the family, and do not expose database or function internals.

### Operator workflow

- Login requires a valid Supabase Auth user linked to an active operator.
- Expired sessions refresh safely; unauthorized requests fail closed.
- Ownership, reassignment, call history, follow-up, interview, research review, handoff and outcome actions retain the acting operator and timestamp.
- Questions branch from stated facts; unanswered facts remain unknown. Intake alone must not create an eligibility or match claim.
- One completed interview event is written; browser and database triggers must not duplicate it.
- Pending research cannot become canonical or matched until an operator verifies official sources and approves it.

### Reporting

- Reconcile UI counts against read-only database aggregates for the same filters and dates.
- Keep reach, identifiable contact, completed intake, interview, researched route, assisted action, handoff, verified outcome and persistence separate.
- Use eligible/relevant denominators for branching questions rather than all families.
- Verify source and cohort filters do not silently include records outside their definitions.

## Accessibility and resilience

Test keyboard order, visible focus, labels, error association, 44px targets, reduced motion, mobile overflow, slow network, duplicate submission, offline/retry behaviour, long but valid text, missing optional data and denied consent. Do not use screenshots alone as proof of behaviour.

## Evidence and cleanup

For every finding record: severity, exact route/component, reproduction, expected behaviour, observed behaviour, evidence, likely owner and verification status. After an authorised mutation, remove the test record through the supported workflow and verify dependent records/events were handled as intended. Never delete ambiguous or real family data.

Historical audit reports remain evidence of their date, not current instructions. If they mention six phases, `unlockme`, a shared password or fixed fake family profiles, treat those details as superseded.
