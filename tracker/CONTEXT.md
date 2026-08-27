# /tracker Context

Purpose: private family CRM / command center for lead follow-up, first interviews, operational states, outcomes and funnel analytics.

Source-of-truth rules:
- live family operational state lives in Supabase.
- anonymous funnel analytics must not be conflated with CRM case state.
- old WhatsApp/localStorage tracker designs are historical only and must not be restored.
- research outputs should be structured handoffs, not copied into canonical public knowledge without verification.
- never infer an answer that the family did not give. `Not sure` is valid evidence.

## First interview: fast evidence layer

The first interview must remain conversational and quick. Collect matching criteria first, then ask the compact evidence questions injected by `interview-form-enhancements.js`.

Core evidence fields for every first interview:
- `aqoon_discovery`: first acquisition source.
- `prior_awareness`: whether the person knew the specific option/service existed before AQOON.
- `self_navigation`: whether they would have known the next step without AQOON.
- `access_barriers`: what prevented action before contact.
- `other_needs_discovered`: additional needs confirmed during the conversation; this measures whether one entry problem opens a broader navigation relationship.
- `outcome_followup_ok`: whether AQOON may check the outcome later.

Do not ask these as a rigid survey. Work them into the conversation and record the closest truthful answer.

### Hobby / Harrastusten Vantaa reporting

For hobby cases, always capture the child's grade and municipality. When relevant, also capture school, existing hobby participation, prior awareness of Harrastusten Vantaa / Harrastamisen Suomen malli, awareness that groups can be free, registration-help intensity and the main participation barrier.

These fields are designed so reporting can aggregate:
- number of families/children reached;
- number in grades 1–9;
- prior programme awareness;
- prior free-cost awareness;
- main barriers;
- number needing hands-on registration help;
- later registration/start/persistence outcomes.

Never give a client a family-level identity list. Report aggregated counts only.

### Daycare / Pilke evidence refresh

For daycare cases, capture current care state, prior awareness of private daycare, prior cost belief, willingness to consider private daycare when real fee/location/place fit, decision priorities, and whether the application route was understood before AQOON.

This is an evidence refresh, not a scripted sales qualification. It tests whether the original Pilke findings still hold in new families and makes later claims auditable.

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
