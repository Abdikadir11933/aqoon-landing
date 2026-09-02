# /tracker Context

Purpose: private family CRM / command center for lead follow-up, first interviews, operational states, outcomes and funnel analytics.

Source-of-truth rules:
- live family operational state lives in Supabase.
- anonymous funnel analytics must not be conflated with CRM case state.
- old WhatsApp/localStorage tracker designs are historical only and must not be restored.
- research outputs should be structured handoffs, not copied into canonical public knowledge without verification.
- never infer an answer that the family did not give. `Not sure` is valid evidence.

## Current implementation boundary (verified 31 Aug 2026)

The production tracker now has real per-operator identity, not just one shared operator assumption:

- `/tracker` uses Supabase Auth email+password sign-in (`tracker/operator-identity.js`) only. An authenticated account is linked to an active, approved `operators` row by exact email; admin Edge Functions require the matching operator JWT. There is no shared Tracker password or fallback.
- `family_leads.assigned_operator_id` and `last_actor_id`, `family_interviews.operator_id`, `sales_opportunities.owner_operator_id`, `sales_activities.operator_id` and `ops_events.operator_id` now exist and are populated by the Edge Functions on every save when the caller is signed in — no longer absent.
- Call outcomes write to `family_call_log` (full history: operator, outcome, timestamp, notes) in addition to the older `family_leads.last_call_outcome`/`last_call_at` single-value fields, which are kept for backward compatibility.
- The agenda still combines explicit `ops_events`, family follow-up dates and sales next-action dates as one shared list — this has not changed; there is still no "assigned to me only" agenda filter.
- **Not yet built despite the schema/backend existing**: a consent *viewer* in the tracker UI (as of 29 Aug 2026 `family_leads.consent_relevant_updates_ok`/`consent_outcome_followup_ok`/`consent_recorded_at` are written automatically and atomically by `save_interview` whenever the interview's `relevant_updates_ok`/`outcome_followup_ok` answers are an unambiguous Yes/No — see the interview-architecture update below — but no UI displays the stored value yet). Operator sessions now refresh proactively and retry one unauthorized private request once, using a single-flight refresh so concurrent Tracker modules cannot race stale and rotated tokens.
- funnel analytics separate anonymous reach from CRM leads, but downstream action, outcome, persistence and time-to-stage reporting remain incomplete;
- reusable PII-free scenario tables and matching logic are triggered after every completed interview. A pasted deep-research answer is stored with `review_status='pending_review'`; it cannot update canonical scenario knowledge or mark the interview matched until an operator explicitly confirms the cited official sources were checked and calls the atomic approval transition. Operator route rejections create PII-minimized pending feedback signals and never rewrite matching rules automatically.
- completed-interview timeline events are written by the database trigger, with the interview ID in event data. The browser must not create a second event.

Do not describe planned V2 capabilities as current behaviour without checking `docs/decisions/0002-two-operator-os-interview-and-data-foundation.md` and `docs/qa/full-repository-audit-2026-08-28.md` first — this file is a summary, not the source of truth for exact implementation state. The implementation goal and audit brief live in `../docs/briefs/aqoon-two-operator-os-v2-fast-start.md`.

## Two-operator target

Evolve the tracker into a company operating system in which Abducadir and Mustafe can see their own work, deliberately accept or reassign ownership, finish a family relationship without accidental mid-case switching, cover each other when needed and leave a trustworthy history of actions and decisions. The system must remain useful when more operators, languages, partners and service categories are added.

The target is outcome-based, not a predetermined schema or UI. Any implementation must first map the current runtime, database, Edge Functions, automations and real workflow, then choose the smallest safe architecture that achieves the goal.

## Runtime asset map

`tracker/` has no subfolders: JS and CSS assets sit next to `index.html`. Do not rely on a fixed prose file count. The current HTML loads 31 deferred JavaScript sources explicitly; `scripts/build_tracker_bundle.js` owns the exact ordered manifest and `tests/tracker-bundle.test.js` rejects missing, extra or reordered scripts. Before changing the tracker, derive the runtime inventory from `tracker/index.html`, compare it with `git ls-files tracker/`, and run both the bundle test and `node scripts/tracker_collection_qa.js`. A source file is not proven active merely because it exists, and an empty compatibility stylesheet is not automatically a defect.

**Bootstrap / identity** — `operator-identity.js` (sign-in/sign-up, JWT attribution, ownership badges) · `crm-reactive.js` (small live-state strip on the analytics tab; as of 29 Aug 2026 it no longer injects `interview-match.js` dynamically — that file is a normal static `<script defer>` tag in `index.html` now, see the interview note below) · `multineed-adapter.js` (patches `list` API responses to surface `additional_needs` in lead-card notes).

**Core rendering** — `app.js` (the entire engine: login/unlock, dashboard, CRM list/filter/render, analytics rendering; `openInterview()` now only clears `#questions` and lets the interview scripts below own it — its own older, simpler built-in question set (`Q`/`qHtml`/`bindQ`/`saveInterview`) is untouched dead code, kept only as inert fallback source, not invoked) · `visual-v3.js` (SLA rings, triage grouping labels, tab icons, funnel drop annotations) · `human-labels.js` (translates internal status/stage codes and a few Somali label variants to consistent display text) · `crm-manage.js` (manual add/remove family, `family-leads-manage`) · `incomplete-intake.js` ("finish this partial intake" drawer, `family-incomplete-admin`).

**Interview** (see also "First interview architecture" below and `docs/decisions/0002-two-operator-os-interview-and-data-foundation.md` §1–2 and §7 for the field-ID-drift, evidence-layer-duplication and 29 Aug 2026 consolidation history) — `interview-match.js` (route-specific first-interview questions + deep-research prompt builder; explicitly loaded from `index.html`) · `interview-match-preview.js` (explicitly loaded from `index.html`, but server-gated until an interview is completed so raw intake cannot generate a candidate route or eligibility-style preview) · `interview-form-enhancements.js` (older Pilke/hobby depth-evidence layer; as of 29 Aug 2026 its `addCoreEvidence`/`addHobbyEvidence`/`addDaycareEvidence` batteries are gated behind `PILOT_DEPTH_MODULE_ENABLED`, default `false` — off unless deliberately re-enabled as a pilot; `enhanceBarrier`/`addJobSearchProfile`/`addConditionNote` stay always-on since they are not duplicative) · `universal-proof-questions.js` (canonical universal-evidence + branching layer; also renders the "Interview insights" analytics tab) · `interview-smart-notes.js` (suggests structured answers from free-text call notes) · `scenario-learning.js` (PII-free scenario matching + "save verified research").

`household-people.js` owns the short Family basics opening. The contacted person already exists as the household's unique canonical `contact`; the operator must never recreate that person as another adult. The opening records parent/guardian status, child count and one age per explicitly identified child, then links a child-led need only after the operator chooses which child it concerns. Other adults remain an optional disclosure. Child rows are saved atomically with stable IDs before the interview save is replayed; omitted saved children are never silently deleted. Explicit child ages may populate backward-compatible interview age-band answers, but old age-band hints must never create people.

**Sales & analytics** — `operations-system.js` (sales pipeline + agenda, `ops-admin`) · `call-outcomes.js` ("what happened on this call" modal, `record_call_outcome`) · `analytics-mobile-v2.js` (mobile-specific analytics tab enhancements).

**CSS** — one file per matching JS/section: `app.css`, `usability.css`, `workspace-ux.css`, `analytics-actions.css`, `analytics-mobile-v2.css`, `call-outcomes.css`, `crm-manage.css`, `crm-reactive.css`, `operations-system.css`, `research-analytics.css`.

## First interview architecture

Every first interview has four layers:

1. **Family basics** — confirm who is already the primary contact and record only explicit household people without asking the operator to recreate the caller.
2. **Route-specific matching questions** — only the facts needed to solve the presenting problem and build a deep-research brief.
3. **Universal evidence baseline** — the same core questions across every interview so aggregate claims use a comparable denominator.
4. **Conditional life-stage packs** — work, daycare, school/hobby and rotating research questions shown only when relevant.

The first interview is a fact-gathering step, not a match screen. Intake answers select only the conversation topic and the conditional questions to ask; they must not create a candidate route, a benefit preview or an eligibility implication. Only after the first interview is saved with the relevant qualifying facts may an operator build the research brief and investigate current routes. “Possible — must confirm” is reserved for that later researched workflow; it is never a promise, benefit calculation, authority decision or automatic referral.

This structure follows a short semi-structured interview model: fixed comparable measures plus branching/skip logic. Do not make every person answer every domain question. Irrelevant questions create noise, increase interview time and weaken data quality.

The universal layer is implemented in `universal-proof-questions.js`. Its save interceptor merges every visible/answered `data-key` field into the `save_interview` payload and also appends the universal evidence to the generated deep-research prompt. This is required because dynamically injected questions are not part of the original `app.js` closure.

### Universal baseline

Ask naturally at the end of every first interview:
- `aqoon_awareness_before`: whether AQOON was already known;
- `entry_service_awareness`: whether the exact entry service/programme/opportunity was known;
- `entry_service_self_navigation`: whether the person would have known the next step without AQOON;
- `entry_blockers`: what prevented action;
- `household_children`: backward-compatible compact household/life-stage snapshot, derived only from explicit Family basics child ages or answered directly in historical interviews;
- `work_interest_gate`: whether employment support is relevant now/soon;
- `cross_service_needs_all`: other confirmed needs discovered;
- `aqoon_return_intent`: whether the family would come back with another Finnish-system question;
- `relevant_updates_ok`: whether AQOON may contact them when a clearly relevant opportunity/application window opens;
- `outcome_followup_ok`: whether outcome follow-up is okay.

As of 29 Aug 2026, when a first interview is saved as `completed` and either of these two answers is an unambiguous "Yes" or "No", `family-leads-admin`'s `save_interview` action also writes `family_leads.consent_relevant_updates_ok`/`consent_outcome_followup_ok`/`consent_recorded_at` in the same lead-record update — atomically with the interview save, not a separate step. An answer of "Not sure"/"Ask each time" never overwrites a previously recorded consent value.

Do not ask these as a rigid questionnaire. Ask in conversation, then tap the closest truthful answer.

### Work branch

Show when the person is looking for work now or expects to within 12 months. Aggregate:
- active jobseeker status (`jobseeker`);
- employment/integration/activation plan status (`employment_plan_status`);
- awareness of työkokeilu, oppisopimus, palkkatuki, kotoutumissuunnitelma and työhönvalmennus (`work_support_awareness`).

This lets AQOON answer questions such as: “Of the people interviewed who were looking for work, how many did not have active job search or any plan?” Use the work-relevant denominator, not all interviewees.

### Children / daycare branch

The household gate shows daycare questions only when there is a child under school age. Aggregate:
- prior private-daycare awareness;
- current/upcoming daycare need;
- ability to self-navigate the application route;
- whether a proactive reminder before the next application need would be useful.

Deep daycare cases still receive the fuller Pilke-specific questions from `interview-form-enhancements.js`.

### School / hobby branch

Show school questions only for families with children in grades 1–9. If the family is in Vantaa, also show Harrastusten Vantaa questions:
- prior awareness;
- whether a child could use a place now/next round;
- permission/usefulness of a reminder before the next registration/opening.

Deep hobby cases still receive the fuller Vantaa pilot fields including grades, registration stage and persistence.

### Rotating “question of the week”

`universal-proof-questions.js` contains a `WEEKLY` config. Keep it disabled unless there is a defined research/funder question. When enabled, set a stable ID, exact wording, response options and optional municipality filter. Never silently change the meaning of an existing field ID; use a new ID for a new question so historical aggregates remain valid.

## Interview design rules

- The primary contact is already a person. Do not ask the operator to add that adult again, and do not assume the person being helped is always the caller.
- A lower child count is not a deletion instruction. Correct or reassign an existing child explicitly when a saved record is wrong or linked to a need.
- Keep universal baseline + branching to roughly 1–3 extra minutes in a normal call.
- Prefer closed response options for anything that must aggregate; use notes only for nuance.
- Use mutually clear response options and always allow `Not sure` when appropriate.
- Use multi-select only when multiple answers can genuinely coexist.
- Separate awareness (“heard of it”) from understanding (“knew what it was/how to use it”).
- Separate intent from observed action/outcome.
- Use conditional denominators in reporting. Example: Harrastusten Vantaa awareness among Vantaa families with grade 1–9 children, not among all AQOON callers.
- Do not lead respondents into saying they need a service. Explain briefly, then record whether it is relevant.
- When a new need is confirmed, treat it as a real future route/lead to follow, not merely a research answer.
- Pre-test new question packs in a few live interviews; if wording repeatedly needs explanation, rewrite it before treating the metric as stable.

## Hobby / Harrastusten Vantaa reporting

For deep hobby cases, capture the child's grade and municipality plus household grade 1–9 count, existing hobby participation, programme awareness, free-cost awareness, registration-help intensity, participation barrier, registration/start stage and persistence.

Never give a client a family-level identity list. Report aggregated counts only.

## Daycare / Pilke evidence refresh

For deep daycare cases, capture current care state, prior awareness of private daycare, prior cost belief, willingness to consider private daycare when real fee/location/place fit, decision priorities, application-route understanding, help intensity and outcome stage.

This is an evidence refresh, not a scripted sales qualification. It tests whether the original Pilke findings continue to appear in new families and makes later claims auditable.

Acquisition channel roles, source labels and the content-to-outcome contract live in `../workspaces/messaging/references/aqoon-demand-generation-and-content-os.md`. The current runtime stores `referrer_host`, `utm_source`, `utm_medium` and `utm_campaign`; it does not yet have first-class `source_actor`, `source_asset`, `campaign_id` or `entry_problem` fields. Preserve first known source and final contact route separately where the data contract supports them, use a governed non-PII `utm_campaign` ID for campaign/asset mapping, and never infer missing attribution.

## Funnel claim discipline

Separate these levels:
1. Reach: anonymous content/page exposure.
2. Identifiable contact: valid name/phone captured.
3. Completed intake: family submitted the short request.
4. First interview: need and matching criteria confirmed.
5. Match/action: a verified next step, application or registration was started.
6. Outcome: application/registration completed, service started or another concrete result verified.
7. Persistence: outcome remains active at follow-up where relevant.

Never call a view, click, share, save or incomplete session a family outcome. Current conversion rates are provisional until cohorts have enough observation time.

For service research use `../workspaces/family-research/CONTEXT.md`; for evidence claims use `../workspaces/evidence-and-research/CONTEXT.md`; for product QA use `../workspaces/product-qa/CONTEXT.md`.
