# /tracker Context

Purpose: private family CRM / command center for lead follow-up, first interviews, operational states, outcomes and funnel analytics.

Source-of-truth rules:
- live family operational state lives in Supabase.
- anonymous funnel analytics must not be conflated with CRM case state.
- old WhatsApp/localStorage tracker designs are historical only and must not be restored.
- research outputs should be structured handoffs, not copied into canonical public knowledge without verification.
- never infer an answer that the family did not give. `Not sure` is valid evidence.

## Current implementation boundary (V1, verified 28 Aug 2026)

The production tracker is functional but designed around one operator:

- the private admin functions use one shared tracker password, not operator identities;
- family leads, interviews, sales records and calendar events have no durable owner/assignee field;
- the agenda combines explicit `ops_events`, family follow-up dates and sales next-action dates, but it is not yet a real two-person work calendar;
- call outcomes can record reached/no answer/call later, but do not record who called;
- funnel analytics separate anonymous reach from CRM leads, but downstream action, outcome, persistence, operator workload and time-to-stage reporting remain incomplete;
- reusable PII-free scenario tables and matching logic exist, but the internal brain is not operationally populated yet.

Do not describe planned V2 capabilities as current behaviour. The implementation goal and audit brief live in `../docs/briefs/aqoon-two-operator-os-v2-fast-start.md`.

## Two-operator target

Evolve the tracker into a company operating system in which Abducadir and Mustafe can see their own work, deliberately accept or reassign ownership, finish a family relationship without accidental mid-case switching, cover each other when needed and leave a trustworthy history of actions and decisions. The system must remain useful when more operators, languages, partners and service categories are added.

The target is outcome-based, not a predetermined schema or UI. Any implementation must first map the current runtime, database, Edge Functions, automations and real workflow, then choose the smallest safe architecture that achieves the goal.

## First interview architecture

Every first interview has three layers:

1. **Route-specific matching questions** — only the facts needed to solve the presenting problem and build a deep-research brief.
2. **Universal evidence baseline** — the same core questions across every interview so aggregate claims use a comparable denominator.
3. **Conditional life-stage packs** — work, daycare, school/hobby and rotating research questions shown only when relevant.

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
