# Bridge Finland -> AQOON migration map

**Status:** research-input map; no Bridge eligibility calculation or amount estimate is enabled in AQOON.  
**Prepared:** 2026-08-28  
**Bridge snapshot reviewed:** bridge-finland-main, commit 793a3ce686a46ac6c0de6c19242c0683efee711b

## Decision

Bridge Finland is a valuable structured **research and product-design input** for AQOON. It is not a current source of truth for live family matching.

AQOON will reuse its interview structure, deterministic/explainable-matching approach, content patterns and test scenarios. Every public-service fact, criterion, calculation and official link must be independently verified, entered as a source-bound AQOON record and rechecked within its own review window.

This preserves the useful work while keeping the operating boundary clear:

family facts -> current official source -> verified AQOON route -> operator review -> next action

AQOON explains and helps prepare an action. Kela, a municipality, provider, employment authority or other official body decides entitlement, admission, placement and payment.

## What Bridge contains

| Area | Evidence in the Bridge snapshot | AQOON value |
|---|---|---|
| Product model | multilingual, mobile-first benefit navigation and request-for-help funnel | Strong alignment with AQOON's trusted-navigation model |
| Intake | 20 structured questions across location, household, housing, work/study, income and life situation | Candidate interview-field inventory |
| Guidance | Finnish, English and Somali names, short explanations and result-card copy | Copy/content starting point only; Somali needs separate language review before publication |
| Routing | 9 deterministic benefit cards with explanation logic | Explainable-matching pattern and test cases |
| Estimation | range/fixed estimates for selected Kela benefits | Do **not** reuse amounts or formulae until re-verified |
| Quality | 57 Playwright tests for questionnaire, matcher and estimator behavior | Scenario-test seed for AQOON preview |
| Operations | API and admin folders are placeholders; no implemented persistence/admin system | AQOON's existing protected Supabase/Tracker is the operational home |

## Migration classification

| Bridge asset | Classification | AQOON destination | Gate before use |
|---|---|---|---|
| One-question-at-a-time, low-typing intake UX | reuse | /caawi and tracker interview design | Align field names with AQOON's canonical dictionary |
| Household, children, housing, work/study, income and savings question concepts | verify | route-specific criteria / interview prompts | Keep only facts that change a route; add source and rationale |
| Municipality selector / neighbourhood discovery list | verify | municipal scope selector | Check coverage and do not imply service availability by neighbourhood |
| Deterministic, explainable matcher design | reuse | protected operator match preview | Return only confirmed-match / possible-must-confirm / does-not-fit |
| Result-card pattern: reason, uncertainty, official next step | reuse | tracker preview then reviewed public guidance | Never say a benefit/place is guaranteed |
| Existing-benefit and help-request concepts | adapt | current AQOON intake/CRM model | Preserve consent and keep PII in protected systems |
| Multilingual benefit explanations | verify | reviewed Somali public guidance / operator copy | Review accuracy, modern Somali and source freshness |
| Kela official URLs | verify | knowledge_sources | Resolve current canonical page and publisher |
| Benefit amounts, thresholds and monthly brackets | replace | source-backed fact record only when needed | Recheck against current Kela calculator/page; show no rough range by default |
| Direct eligibility rules | replace | source-bound criteria + operator guidance | Cite the exact current official condition and decision-maker |
| Bridge API/admin/data model plan | do not import | AQOON's existing Supabase + Tracker | Avoid parallel CRM, database or public PII path |

## Route-by-route disposition

| Bridge route | Current AQOON treatment | Why |
|---|---|---|
| General housing allowance | discovery candidate | Household income, assets, housing and municipality all materially matter; a single individual-income cutoff is insufficient. |
| Social assistance | discovery candidate | Last-resort support requires fuller case facts and current Kela assessment; no broad-range calculation. |
| Child benefit | verified-source candidate | Useful family interview trigger, but residency/guardian facts and current amounts must be verified before advice. |
| Child home-care allowance | verified-source candidate | Ask child age and care arrangement first; do not match merely because a child is cared for at home. |
| Basic unemployment allowance / labour-market subsidy | **retire/replace** | Kela's general social security benefit replaced both from 1 May 2026. |
| Student financial aid / housing supplement | verified-source candidate | Preserve the student/housing distinction but check student-aid entitlement, home type and child-related exceptions. |
| Sickness allowance | operator-review candidate | Do not collect or publish medical detail; route only after the necessary high-level facts and a current source check. |
| Parental allowance | operator-review candidate | Qualifying period, timing and prior earnings make a broad intake-only estimate unsafe. |

## First AQOON import queue

1. Create a Bridge research register entry per route: origin snapshot, Bridge route ID, source candidate, migration status and owner.
2. Verify the replacement unemployment route first: route.finland.general-social-security-benefit, including jobseeker-registration action and a current Kela source.
3. Verify family routes next: child benefit, home-care allowance, municipal early-childhood education and the private/service-voucher route. Keep Kela benefits and municipal/provider routes separate.
4. Add only route-changing questions to the canonical interview field dictionary. Mark each as required, optional, ask-next or sensitive/not-collected.
5. Convert Bridge test profiles into PII-free AQOON scenario tests. Expected result labels must be checked against current official sources, not copied.
6. Make the Tracker preview read-only first. It may identify missing facts, current official pages and safe next actions; it may not calculate, submit, promise, contact a partner or update family status.
7. Run ten manually reviewed cases before any semi-automated matching or public result-card rollout.

## Current official verification notes

These findings supersede conflicting Bridge logic:

- From 1 May 2026, Kela's general social security benefit replaced Kela-paid basic unemployment allowance and labour-market subsidy. Source: [Kela](https://www.kela.fi/news/general-social-security-benefit-to-replace-kela-paid-unemployment-benefits-in-may-2026).
- General housing allowance depends on the income and assets of the household; municipal and housing context also matters. Source: [Kela](https://www.kela.fi/housing-allowance-income-and-assets).
- Student housing supplement requires eligibility for student financial aid and rented/right-of-occupancy housing; family situations can change the route. Source: [Kela](https://www.kela.fi/financial-aid-for-students-housing-supplement).
- Child home-care allowance is for care of a child under three at home and has care-arrangement conditions. Source: [Kela](https://www.kela.fi/child-home-care-allowance).
- Child-benefit values and family benefits are live facts, not constants. Source: [Kela](https://www.kela.fi/child-benefit).

## Non-negotiable data boundary

Bridge's useful research is generalized. AQOON must never place family names, phone numbers, interview notes, health details, exact income, official identifiers or documents in this public repository or in an unprotected research store.

Family-specific match runs remain in protected Supabase systems. Reusable knowledge remains PII-free, source-backed, versioned and review-dated.
