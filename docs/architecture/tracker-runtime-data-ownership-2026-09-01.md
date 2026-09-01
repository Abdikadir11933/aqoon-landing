# Tracker runtime and data ownership baseline

Status: Gate 1 baseline, 2026-09-01. This is an evidence checkpoint, not a
claim that the operating system is complete.

## Runtime ownership

The deployed Tracker entry point is `tracker/index.html`. It currently loads 27
plain JavaScript files in a fixed order. Nine files capture or replace
`window.openInterview`; four capture or replace `window.fetch`. This layering is
the main regression risk: a later patch can change data after the original
owner has rendered a form or constructed a save request.

The generated, CI-checked inventory is
`docs/architecture/generated-tracker-contract-inventory.json`. It records the
exact load order, API actions, Edge Function slugs, direct and embedded database
relations, browser events, global exports and discovered interview answer keys.
Regenerate it with:

```sh
node scripts/generate_tracker_contract_inventory.mjs
```

CI fails if the checked-in inventory is stale.

## Current backend boundary

The browser calls eight operator-facing Edge Functions:

| Function | Responsibility | Auth boundary |
|---|---|---|
| `family-leads-admin` | lead list/detail, interview save, route matching, analytics | active operator session |
| `family-incomplete-admin` | incomplete-intake queue | active operator session |
| `family-leads-manage` | lead mutations | active operator session |
| `family-route-review-admin` | operator route decisions and feedback | active operator session |
| `family-scenario-admin` | scenario research/reuse | active operator session |
| `family-case-lifecycle-admin` | plans, events, actions, outcomes | active operator session checked inside the function |
| `family-interview-history-admin` | interview revision history | active operator session |
| `ops-admin` | Sales activities and calendar events | active operator session |

All ten operator/admin functions are currently deployed with platform JWT
verification on and also resolve the active operator at the application
boundary. The three public-input functions (`family-intake-contact`,
`family-intake-submit`, `family-funnel-track`) intentionally have platform JWT
verification off and validate/rate-limit their narrow anonymous payloads.

## Live Supabase reconciliation

All 25 tables directly named by the current Edge Functions exist in the live
project and have RLS enabled. The matching read additionally traverses
`knowledge_criteria` from `knowledge_routes`; `knowledge_routes.service_id`
references `knowledge_services`; `family_households` is the parent of the
canonical family graph. Those relations are part of the active system even
when they do not appear as direct `.from(...)` calls. Exact columns and
relationships are recorded in
`docs/architecture/supabase-operational-schema-contract-2026-09-01.md`.

Every active Tracker table currently has zero browser-facing RLS policies. This
is intentional deny-by-default storage: operator access goes through Edge
Functions using the service role after an active-operator check. It must not be
reinterpreted as a missing browser CRUD policy.

The populated `*_knowledge_chunks` tables contain 666 discovery records. They
are not queried by the route preview/matching path. Only reviewed records in
`knowledge_sources`, `knowledge_services`, `knowledge_routes` and
`knowledge_criteria` are decision inputs. Discovery text must never silently
become a family recommendation.

## Live security-advisor baseline

The live security advisor reported 64 notices:

| Notice | Count | Interpretation |
|---|---:|---|
| RLS enabled with no policy | 36 | expected for service-role-only tables, but each new table must be classified |
| mutable function search path | 3 | remediation required |
| extensions in `public` | 2 | infrastructure review required before moving extensions |
| anonymous execution of security-definer functions | 11 | remediation required; primarily legacy knowledge RPCs and `rls_auto_enable` |
| authenticated execution of security-definer functions | 11 | remediation required or explicitly justified |
| leaked-password protection disabled | 1 | Supabase Auth configuration remediation required |

Relevant remediation references:

- [Function search path](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)
- [Extensions in public](https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public)
- [Anonymous security-definer execution](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable)
- [Authenticated security-definer execution](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable)
- [Leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

These warnings are not all safe to change in one migration because the legacy
knowledge product shares the project. Each function grant must first be mapped
to its real caller; unverified callers are a stop condition for that individual
grant change, not for the rest of the audit.

## Ownership rule for the rebuild

The rebuild will reduce the interview stack to one canonical controller and
one canonical save-payload builder. Compatibility adapters may translate old
records, but they may not mutate new interview answers, route domains or save
requests after the canonical builder has run.

No runtime layer may be retired until its behavior has either:

1. moved into the canonical owner and is covered by a contract test, or
2. been proven unused in the deployed entry point and live data path.
