# /tracker Context

Purpose: private family CRM / command center for lead follow-up, first interviews, operational states, outcomes and funnel analytics.

Source-of-truth rules:
- live family operational state lives in Supabase.
- anonymous funnel analytics must not be conflated with CRM case state.
- old WhatsApp/localStorage tracker designs are historical only and must not be restored.
- research outputs should be structured handoffs, not copied into canonical public knowledge without verification.
- never infer an answer that the family did not give. `Not sure` is valid evidence.

## Current implementation boundary (verified 28 Aug 2026, updated same day after real login shipped)

The production tracker now has real per-operator identity, not just one shared operator assumption:

- `/tracker` primarily uses real Supabase Auth email+password sign-in (`tracker/operator-identity.js`), linked one-to-one to a row in `operators`. The original shared tracker password still works as an explicit fallback ("Trouble signing in?"), checked via OR-logic in every admin Edge Function (correct password OR a verified operator JWT) — never both required. See `../docs/decisions/0002-two-operator-os-interview-and-data-foundation.md` §6 for the exact implementation and the two execution-order bugs caught before shipping.
- `family_leads.assigned_operator_id` and `last_actor_id`, `family_interviews.operator_id`, `sales_opportunities.owner_operator_id`, `sales_activities.operator_id` and `ops_events.operator_id` now exist and are populated by the Edge Functions on every save when the caller is signed in — no longer absent.
- Call outcomes write to `family_call_log` (full history: operator, outcome, timestamp, notes) in addition to the older `family_leads.last_call_outcome`/`last_call_at` single-value fields, which are kept for backward compatibility.
- The agenda still combines explicit `ops_events`, family follow-up dates and sales next-action dates as one shared list — this has not changed; there is still no "assigned to me only" agenda filter.
- **Not yet built despite the schema/backend existing**: a call-history viewer in the tracker UI (data is captured, nothing displays it), a consent UI (columns exist and are writable, no UI sets them), and token refresh for the auth session (JWT expires after ~1h and requires signing in again — not a bug, just not built yet).
- funnel analytics separate anonymous reach from CRM leads, but downstream action, outcome, persistence and time-to-stage reporting remain incomplete;
- reusable PII-free scenario tables and matching logic exist and are correctly triggered after every completed interview, but `family_scenarios`/`family_scenario_research` still have 0 rows in production — the mechanism works, nobody has used it yet.

Do not describe planned V2 capabilities as current behaviour without checking `docs/decisions/0002-two-operator-os-interview-and-data-foundation.md` and `docs/qa/full-repository-audit-2026-08-28.md` first — this file is a summary, not the source of truth for exact implementation state. The implementation goal and audit brief live in `../docs/briefs/aqoon-two-operator-os-v2-fast-start.md`.

## Two-operator target

Evolve the tracker into a company operating system in which Abducadir and Mustafe can see their own work, deliberately accept or reassign ownership, finish a family relationship without accidental mid-case switching, cover each other when needed and leave a trustworthy history of actions and decisions. The system must remain useful when more operators, languages, partners and service categories are added.

The target is outcome-based, not a predetermined schema or UI. Any implementation must first map the current runtime, database, Edge Functions, automations and real workflow, then choose the smallest safe architecture that achieves the goal.

## File map (27 flat asset files, added 28 Aug 2026 for navigability)

`tracker/` has no subfolders — every JS/CSS file sits flat next to `index.html`. Deliberately not reorganized into subfolders (would require rewriting every `<script>`/`<link>` path in `index.html` with real risk of silently breaking a live feature, including login, with no way to test the result end-to-end from an agent session — see `docs/qa/full-repository-audit-2026-08-28.md`). This map exists instead, so grouping is visible without opening every file. **A prior audit session missed several of these files entirely** because a truncated directory listing hid them in the flat structure — read this map, or `git ls-files tracker/`, never a truncated `ls`.

**Bootstrap / identity** — `operator-identity.js` (sign-in/sign-up, JWT attribution, ownership badges) · `crm-reactive.js` (small live-state strip on the analytics tab — **also the file that dynamically injects `interview-match.js` into the page**; that file has no static `<script>` tag of its own) · `multineed-adapter.js` (patches `list` API responses to surface `additional_needs` in lead-card notes).

**Core rendering** — `app.js` (the entire engine: login/unlock, dashboard, CRM list/filter/render, analytics rendering, and its **own older, simpler built-in interview question set** used as a fallback — see the interview note below) · `visual-v3.js` (SLA rings, triage grouping labels, tab icons, funnel drop annotations) · `human-labels.js` (translates internal status/stage codes and a few Somali label variants to consistent display text) · `crm-manage.js` (manual add/remove family, `family-leads-manage`) · `incomplete-intake.js` ("finish this partial intake" drawer, `family-incomplete-admin`).

**Interview** (see also "First interview architecture" below and `docs/decisions/0002-two-operator-os-interview-and-data-foundation.md` §1–2 for the field-ID-drift and evidence-layer-duplication history) — `interview-match.js` (route-specific matching questions + deep-research prompt builder; **loaded dynamically by `crm-reactive.js`, not a static tag** — if that injection ever silently fails, the tracker falls back to `app.js`'s own different, older question set and a different save handler without any visible error) · `interview-match-preview.js` (static, protected read-only call to `family-leads-admin` action `match_preview`; shows only currently verified route candidates, their missing confirmation fields, official sources and any partner disclosure; it neither saves `family_match_runs` nor decides eligibility) · `interview-form-enhancements.js` (older evidence layer, partly superseded but intentionally still active for hobby/daycare Pilke-depth questions) · `universal-proof-questions.js` (canonical universal-evidence + branching layer; also renders the "Interview insights" analytics tab) · `interview-smart-notes.js` (suggests structured answers from free-text call notes) · `scenario-learning.js` (PII-free scenario matching + "save verified research"; correctly wired but zero production rows so far, per the full audit).

**Sales & analytics** — `operations-system.js` (sales pipeline + agenda, `ops-admin`) · `call-outcomes.js` ("what happened on this call" modal, `record_call_outcome`) · `analytics-mobile-v2.js` (mobile-specific analytics tab enhancements).

**CSS** — one file per matching JS/section: `app.css`, `usability.css`, `workspace-ux.css`, `analytics-actions.css`, `analytics-mobile-v2.css`, `call-outcomes.css`, `crm-manage.css`, `crm-reactive.css`, `operations-system.css`, `research-analytics.css`.

## First interview architecture

Every first interview has three layers:

1. **Route-specific matching questions** — only the facts needed to solve the presenting problem and build a deep-research brief.
2. **Universal evidence baseline** — the same core questions across every interview so aggregate claims use a comparable denominator.
3. **Conditional life-stage packs** — work, daycare, school/hobby and rotating research questions shown only when relevant.

The verified-route preview is a fourth, deliberately non-persistent aid: it fetches current source-bound route records on opening the interview and adds only the missing route-critical questions to the existing question area. “Possible — must confirm” means the available facts do not rule the route out; it is never a promise, a benefit calculation, an authority decision or an automatic referral. An authenticated operator still verifies the family facts and the authority/provider’s current rules.

This structure follows a short semi-structured interview model: fixed comparable measures plus branching/skip logic. Do not make every person answer every domain question. Irrelevant questions create noise, increase interview time and weaken data quality.

The universal layer is implemented in `universal-proof-questions.js`. Its save interceptor merges every visible/answered `data-key` field into the `save_interview` payload and also appends the universal evidence to the generated deep-research prompt. This is required because dynamically injected questions are not part of the original `app.js` closure.

### Universal baseline

Ask naturally at the end of every first interview:
- `aqoon_awareness_before`: whether AQOON was already known;
- `entry_service_awareness`: whether the exact entry service/programme/opportunity was known;
- `entry_service_self_navigation`: whether the person would have known the next step without AQOON;
- `entry_blockers`: what prevented action;
- `household_children`: compact household/life-stage gate;
- `work_interest_gate`: whether employment support is relevant now/soon;
- `cross_service_needs_all`: other confirmed needs discovered;
- `aqoon_return_intent`: whether the family would come back with another Finnish-system question;
- `relevant_updates_ok`: whether AQOON may contact them when a clearly relevant opportunity/application window opens;
- `outcome_followup_ok`: whether outcome follow-up is okay.

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
