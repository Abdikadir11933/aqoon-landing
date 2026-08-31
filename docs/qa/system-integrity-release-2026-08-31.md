# AQOON system integrity release — 2026-08-31

This is the canonical release-state note for the AQOON family operating system after the end-to-end integrity pass.

## Release rule

- Canonical application branch: `master`.
- Production frontend: Vercel project `aqoon-landing` / `aqoon.live`.
- Production database/functions: Supabase project `qxracwbsyfibcelasxbs`.
- No feature work is considered released until it is committed to `master`, CI passes, the Vercel production deployment is READY, and any changed Edge Function is ACTIVE in Supabase.

## End-to-end data path

1. Public intake (`/caawi`) records anonymous funnel analytics through `family-funnel-track`, saves phone-first contact state through `family-intake-contact`, and completes the request through `family-intake-submit`.
2. CRM reads canonical family, incomplete-intake, interview and operator state through authenticated `family-leads-admin` endpoints.
3. First contact records mandatory outcomes in `family_call_log`; unreachable outcomes require a future follow-up.
4. First interview persists `family_interviews`, updates `family_leads.interview_status`, consent and journey state, and the database completion trigger records `interview_completed` in `family_case_events`.
5. Verified route preview is blocked until interview completion and uses verified `knowledge_routes`, `knowledge_criteria` and `knowledge_sources`.
6. Operator route reviews persist in `family_match_runs`; route selection/manual planning creates or updates `family_case_plans`.
7. Lifecycle work and outcomes are recorded through `family-case-lifecycle-admin` in case plans/events/interactions/future opportunities as applicable.
8. Resolution requires the completed-interview/case-plan lifecycle and moves the family to the resolved state; the workflow can be safely reopened or moved backward without deleting interview evidence.
9. Analytics reads anonymous funnel events plus CRM lifecycle state and surfaces both acquisition/form conversion and full family-journey operational metrics.
10. Sales uses `sales_opportunities`, `sales_activities` and `ops_events`. Buyer-facing demand is aggregate only; family names/phones are never included in the sales-demand aggregate.

## Active Edge Functions

The production AQOON endpoint set is:

- `family-intake-contact`
- `family-intake-submit`
- `family-funnel-track`
- `family-leads-admin`
- `family-leads-manage`
- `family-incomplete-admin`
- `family-scenario-admin`
- `family-route-preview-admin`
- `family-route-review-admin`
- `family-interview-history-admin`
- `family-case-lifecycle-admin`
- `ops-admin`
- `nightly-retention`

Authenticated operator endpoints require a valid Supabase session mapped to an active row in `operators`. Public intake endpoints are intentionally unauthenticated but validate/limit their public payloads server-side. `nightly-retention` is a maintenance endpoint and is restricted to the intended server-side authorization path.

## Database security model

AQOON operational tables have RLS enabled. Several intentionally have no client RLS policies because the browser does **not** access those tables directly; authenticated Edge Functions use the service role after independently validating the operator session. The Supabase linter therefore reports `rls_enabled_no_policy` as informational for these service-only tables. Adding permissive client policies merely to silence the warning would weaken the current boundary and is not a fix.

Security-advisor warnings for unrelated legacy/vector knowledge applications in the same Supabase project are outside the AQOON tracker release boundary and must not be changed as part of tracker cleanup without auditing their owning application.

## Integrity checks enforced in CI

- Repository context/skill/file integrity.
- Browser credential guardrails.
- Tracker server-collection contract.
- Critical browser/server action contracts, including persisted family edit and phase rollback.
- Explicit active tracker JavaScript load order.
- Tracker and public JavaScript syntax.
- Mobile/usability/accessibility guards.
- Public route, sitemap, SEO, legal and privacy checks.
- Caawi and call-outcome regression tests.

The collection-contract guard includes `family_intake_rate_limits`; this is active anti-abuse infrastructure and is not dead data merely because it is not an operator-facing table.

## Live consistency invariants

The post-audit live checks must remain at zero for:

- completed intake without a CRM lead (excluding intentionally removed/deleted historical rows),
- completed interview without the lead completion flag,
- lead completion flag without a completed interview,
- missing `interview_completed` timeline event,
- match run before completed interview,
- case plan before completed interview,
- resolved lead without a resolved case plan,
- call outcome without a call-log record,
- active sales opportunity without a concrete next action,
- active sales opportunity without an owner.

## Deletion/privacy behavior

Deleting a CRM family removes the linked completed intake contact as well as family-linked lifecycle records; anonymous funnel events are retained because they contain no family phone and remain useful for aggregate conversion analysis. Do not attempt to infer anonymous session identity from a deleted phone number.

The test phone purge requested on 2026-08-31 left zero matching rows in `family_leads`, `family_intake_contacts`, and `waitlist` for the supplied test number.

## Release hygiene

At the time of this release audit there were no open pull requests. `master` contains the complete released commit chain. A temporary verification branch (`tmp-no-jump-check`) pointed to the exact same SHA as `master`, so it contained no unmerged code or divergent release state.

Do not restore superseded tracker UX layers simply because their historical files/commits exist. The active page load graph and CI contract define which browser modules are production code.
