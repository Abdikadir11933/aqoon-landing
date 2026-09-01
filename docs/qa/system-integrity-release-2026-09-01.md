# AQOON one-system integrity release — 2026-09-01

Status: final evidence checkpoint for the intake → interview → matching →
research → plan → action → outcome → Analytics/Sales/learning rebuild. It does
not claim that unknown external products in the shared Supabase project are
safe or that future regressions are impossible.

## Release identity

- Repository: `Abdikadir11933/aqoon-landing`, branch `master`.
- Frontend: Vercel project `aqoon-landing`, production domain `aqoon.live`.
- Backend: Supabase project `qxracwbsyfibcelasxbs`.
- Required close: full local QA, both GitHub workflows, exact-SHA READY Vercel
  deployment, ACTIVE Edge parity and post-migration database invariants.

## Verified end-to-end ownership

1. `/caawi` records anonymous funnel events, a recoverable phone-first partial
   intake, and one final multi-need request through three narrow public Edge
   Functions.
2. The operator queue reads partial contacts and canonical CRM cases through
   authenticated Edge Functions. Logging an unreachable partial contact does
   not invent a lead; completing intake is the only promotion step.
3. The first interview uses one canonical v5 payload. Scenario-specific
   decisive facts, operator context, optional relationship signals, consent,
   next action and schema version persist together. Hidden answers are cleared
   and server validation rejects an incomplete “completed” interview.
4. The household graph separates household, people and needs. Present needs,
   future hints and permissioned future interests have different states and
   cannot silently activate route matching.
5. Matching uses current verified services, routes, criteria and official
   sources. A route can be confirmed only from fitting decisive facts; missing,
   conflicting, authority-owned or stale facts stay visible.
6. “Not sure” produces a focused research contract. A pasted answer remains
   pending until an operator checks its official sources and explicitly
   approves or rejects it.
7. Route choice and the five-step follow-up are atomic, request-idempotent
   transitions. Agreement, pending decision, official action, response,
   persistence, resolution and reopening cannot be represented by partial
   browser writes.
8. Named partner handoff is a separate per-family consent event. The operator
   selects the recipient and minimum disclosure scope; withdrawal and partner
   outcome are atomic and auditable.
9. Analytics uses explicit denominators and household-deduplicated signals.
   Sales receives controlled demand timing/domain aggregates and consented
   handoff outcomes, never a copied family CRM list.
10. Operator rejections become PII-minimized feedback awaiting human review;
    they never rewrite eligibility rules automatically.

## Production proof

- 29 AQOON operational tables: all present, RLS enabled, zero browser table
  grants.
- All code-called tables and RPCs are now owned by repository migrations; the
  earlier rate-limit legacy exception was removed.
- All 13 repository Edge Functions are ACTIVE and byte-for-byte equal to their
  committed entrypoint/shared files. The final parity correction updated:
  `nightly-retention` v5, `family-leads-manage` v8 and
  `family-route-preview-admin` v7.
- The preview correction removed the old behavior that treated
  `cross_service_needs_all` as an immediate matching need. Preview and saved
  matching now use the same current route-domain selector.
- Six historical completed interviews are explicitly
  `legacy-unversioned`—not falsely relabeled v5—and the table-wide completed
  version constraint is validated. Revision history preserves the prior rows.
- Verified routes/sources past their recheck date: zero.
- Pending route-feedback and scenario-research queues: zero at the checkpoint.
- Plan without canonical need, future signal without provenance, permissioned
  contact without consent, confirmed match with stale knowledge, partner
  handoff without consent/domain agreement, duplicate active plan and
  lead/interview-state mismatch: all zero.
- A production transaction using synthetic data completed family agreement,
  official action, official response and resolution, verified idempotent replay
  and then rolled back. Follow-up probe rows after rollback: zero.
- Vercel reported no runtime error clusters in the preceding seven days. Live
  Tracker, Caawi, follow-up, Analytics and Sales assets contain the released
  contracts.
- Local regression/QA result before closing commit: 190 tests pass; repository,
  collection, route/site, legal and usability checks pass. One pre-existing
  non-core static warning remains for a dynamically generated PKV practice
  checkbox label.

## Shared-project security follow-up

- A repository-wide and connected-GitHub caller trace identified the legacy
  RPC owner as `Abdikadir11933/AqoonPRO`, not AQOON Family Desk.
- `AqoonPRO/src/db/supabase.js` creates its database client with
  `SUPABASE_SERVICE_ROLE_KEY`; its own migrations grant `increment_usage` and
  the eight `match_*_chunks` functions only to `service_role` and define no
  browser RLS policies for the chunk tables.
- Production now pins both `increment_usage` overloads to
  `search_path = pg_catalog, public`, removes browser execution from
  `rls_auto_enable`, and enforces service-role-only execution on the two usage
  overloads and eight vector-match functions.
- Direct `anon`/`authenticated` privileges were removed from all nine legacy
  knowledge-chunk tables. Verification found zero browser grants while all
  verified server RPC callers retain `service_role` execution.
- The Supabase security-advisor result fell from 41 INFO + 27 WARN to
  41 INFO + 3 WARN. The remaining warnings are two shared extension-location
  notices and the Auth leaked-password setting.
- Regression coverage now contains 192 passing tests, including the
  shared-project service-role boundary.

## Remaining boundaries—not called fixed

| Boundary | Status | Why it remains |
|---|---|---|
| Supabase leaked-password protection | configuration action required | The advisor reports it disabled; the available database/Edge tools do not own Auth password-policy configuration. |
| `pg_net` and `vector` in `public` | accepted shared-infrastructure boundary | Moving either extension changes shared database object resolution and is not necessary for the Family Desk release. Keep this visible and migrate only as a separately tested AqoonPRO/Supabase infrastructure change. |
| Authenticated operator browser walkthrough | operator acceptance test | Static/live asset, Edge parity and rollback database tests pass; the owner should still complete one real no-PII acceptance persona through the browser after this release. |

The weekly `AQOON System Drift` and `AQOON Account Drift` automations are
enabled for Monday mornings in `Europe/Helsinki`. The system task checks the
exact GitHub/Vercel/Supabase contract read-only and treats lead assignment as
informational, per the owner’s rule.
