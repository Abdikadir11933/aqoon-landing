# AQOON family system comprehensive audit — 2 September 2026

Status: repository corrections complete and deterministic QA green. Database migrations and Edge Function changes in this audit are **not deployed** by this work session.

## Scope

Included:

- canonical Somali family surface `/caawi` and all 39 Caawi pages;
- family SEO, metadata, sitemap, redirects and internal links;
- phone-first intake, consent, attribution, retry and analytics behaviour;
- public family Edge Functions;
- private `/tracker`, its 31 runtime modules and operator workflows;
- Supabase family/knowledge tables, RPC ownership, RLS posture, retention and advisor findings;
- current operating, messaging and testing instructions.

Excluded deliberately:

- AQOON public B2B seller-site design and copy;
- protected `/pilke` pages;
- production mutations, deployment, push and real-family test creation;
- authenticated post-login browser testing without an authorised operator session.

## Executive result

The family system has a coherent canonical route and a strong tested workflow, but the audit found material drift at four boundaries: operating documentation, consent enforcement, tracker asset loading and database reproducibility. All four are corrected in the repository.

The strongest remaining release risk is not an unresolved code failure. It is that the new consent/rate-limit/database changes require a coordinated migration and Edge Function deployment before the browser change is released. Do not deploy `caawi/app.js` alone.

## Findings and disposition

| Severity | Area | Finding | Disposition |
|---|---|---|---|
| High | Intake privacy | Final contact permission was browser-only, not sent, server-enforced or timestamped. A direct submit could bypass the checkbox. | Fixed in browser payload, Edge Function validation and a new auditable `contact_consent_at` column. |
| High | Intake integrity | `family-intake-submit` did not require the matching phone-first contact record. | Fixed: submit now requires the same request ID and normalized phone already saved by `family-intake-contact`. |
| Medium | Public API | `family-funnel-track` had strict event validation but no request-rate guard. | Fixed: shared IP-hash hourly limiter, 120 events/hour. |
| Medium | Analytics | Accepting analytics did not persist the consented visitor ID, splitting later page loads into a different visitor. | Fixed and regression-tested. |
| Medium | Tracker runtime | The declared script-order test covered only a subsequence. Five static modules and two dynamically injected modules were outside the exact contract. Dynamic injection did not guarantee relative execution order. | Fixed: 31 scripts are explicit and ordered; exact-list test and generated inventory updated. |
| Low | Dead code | Superseded `followup-workflow-v1.js` and `interview-ux-v3.js` remained tracked but undeployed. | Removed after repository-wide reference check. |
| Medium | Database reproducibility | Three live retention/erasure helper functions were called and permissioned by migrations but their definitions were absent from the repository migration history. | Fixed: live definitions reconciled into a new idempotent migration with pinned search paths and service-role-only execution. |
| Medium | Database performance | Live advisor and catalog comparison identified 16 foreign keys without covering indexes. | Fixed in a new idempotent index migration; requires deployment. |
| Medium | Accessibility | Caawi errors were visual only; invalid fields did not expose state; leave dialog lacked description, focus containment and Escape handling. | Fixed with live regions, `aria-invalid`, error associations, focus restoration/trap and Escape-to-stay. |
| Medium | Accessibility | Tracker family/sales dialogs lacked accessible names; interview drawer lacked dialog semantics; primary actions relied on implicit button types. | Fixed and regression-tested. Full authenticated keyboard testing remains a release check. |
| Medium | Documentation | Canonical files still used retired English offer names, fixed-person delivery, Pilke-specific public prices, an obsolete shared password and a six-phase test model. | Fixed or clearly marked as historical. Partner-specific prices removed from the public operating model. |
| Low | Route documentation | A live first-call reference still pointed to `/so/ajankohtaiset`. | Fixed to `/caawi/ajankohtaiset`. `/so/*` remains redirect-only. |
| Info | Caawi structure | Across 39 pages: no duplicate IDs, heading skips, missing canonical tags, missing Somali language tags, unsafe `_blank` links, unlabelled controls, missing image alt text or live `/so` links were found. | Verified clean. |
| Info | Security posture | Family/knowledge tables use RLS with no browser policies by design; access is through authenticated Edge Functions/service role. Advisor reports these as 41 informational `rls_enabled_no_policy` notices. | Retain fail-closed posture; document rather than add broad policies. |
| Warning | Supabase project | Security advisor still reports `pg_net` and `vector` in `public`, and leaked-password protection disabled. | Deferred project-level hardening; requires owner decision and Auth dashboard change. |
| Warning | External sources | The verified-link checker could not complete because outbound network approval was cancelled. Internal route checking completed successfully. | Rerun before release when network verification is available. |

## Live data and connection audit

Read-only inspection confirmed the operational system is connected rather than empty scaffolding. Counts observed during the audit included 26 family leads, 31 intake contacts, 6 interviews, 21 households/people, 26 canonical needs, 29 future-opportunity signals and 868 anonymous funnel events. No partner handoff had yet been recorded. Counts are an operational snapshot, not public evidence and no PII was copied into this report.

All public family/knowledge tables inspected had RLS enabled. Public input functions remain unauthenticated at the platform gateway because they implement their own validation, CORS and rate controls; operator/admin functions remain authenticated. The repository contract finds 25 server collections referenced by tracker Edge Functions and no unknown collection or action.

The public and internal stage vocabularies remain deliberately different in granularity. Reporting must continue to keep anonymous reach, identifiable contact, completed intake, interview, researched route, assisted action, partner handoff, verified outcome and persistence separate.

## SEO and family-content audit

- `/caawi` is the only canonical family surface; `/so/*` is permanent redirect compatibility.
- 56 sitemap routes and 39 Caawi family pages pass site and metadata QA.
- 504 internal links, 18 static redirects and 64 HTML files pass route integrity.
- Somali-language QA produced zero review candidates.
- Family SEO and B2B SEO remain separate intent lanes. No B2B seller CTA was introduced into Caawi.
- Existing Caawi content was not rewritten merely for style. Current official facts still require their normal dated source-review process.

## Tracker audit

The deployed source contract is now exact: 31 deferred JavaScript modules in one declared order. Two helper modules previously injected after load are explicit. Generated inventory and tests now fail on a missing, extra or reordered runtime source.

The tested workflow preserves these gates:

1. incomplete contact is not a CRM family;
2. completing intake creates/updates the lead;
3. intake alone cannot create an eligibility or match claim;
4. interview branching follows stated facts and preserves unknowns;
5. research remains pending until official sources are checked and an operator approves it;
6. route selection and lifecycle transitions are atomic and actor-attributed;
7. named partner handoff requires separate disclosure, explicit consent and scoped data;
8. action, response, outcome and persistence remain distinct.

Authenticated visual interaction was not claimed. It still requires a real approved operator account to test focus return, every modal, ownership filters, token expiry/refresh, live count reconciliation and end-to-end case transitions in the deployed environment.

## Documentation corrections

The canonical buyer offer hierarchy is now:

1. `Jatkuva tavoittamisen ja palvelun aloituksen toteutus`;
2. optional `Asiakaspolun ja materiaalien kehitys`;
3. separate `Henkilöstön valmennus`.

Generic public prices and fixed delivery-person claims were removed. Abducadir remains the named public face; other capability is collective and engagement-specific. Historical audit reports are retained as evidence of their date but now carry supersession notices where their shared-password/six-phase assumptions could mislead current work.

## Verification completed

- `node --test tests/*.test.js`: **199/199 passed**.
- repository integrity QA: passed.
- site QA: 56 sitemap routes / 39 Caawi pages passed.
- SEO metadata QA: passed.
- usability QA: passed; only the pre-existing `pkv-treeni` label warning remains outside this scope.
- legal/trust QA: passed.
- internal route/sitemap QA: 64 HTML files, 504 links, 18 redirects passed.
- Somali-language QA: zero candidates.
- tracker collection contract: 25 collections, required actions present.
- tracker generated inventory: current.
- `git diff --check`: passed.

## Release order

1. Review and apply `20260902090000_family_intake_consent_and_retention_reconciliation.sql`.
2. Apply `20260902091000_cover_remaining_family_foreign_keys.sql`.
3. Deploy `family-intake-submit` and `family-funnel-track` together with the new Caawi browser asset.
4. Verify public contact start → consented submit → tracker appearance using explicitly authorised test data and cleanup.
5. Verify authenticated tracker keyboard/modal behaviour and live metrics with an approved operator.
6. Rerun Supabase security/performance advisors and the external verified-link checker.
7. Only then release, commit/push and deploy through the authorised workflow.

## Deliberately not changed

- the B2B seller website while the separate design project is in progress;
- protected Pilke routes;
- current visual brand tokens, pending the approved design output;
- service/eligibility facts without a fresh official-source review;
- live records, operator accounts, Auth settings or production functions.
