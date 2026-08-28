# AQOON operating DNA in the routing brain

Status: canonical architecture direction, 28 August 2026.

## Purpose

AQOON's routing brain needs two independent knowledge layers:

1. **External truth**: current, source-bound Finnish law, authority procedures, municipal services, provider conditions and official calculators.
2. **AQOON operating DNA**: the company's purpose, safety boundaries, family journey, communication rules, consent model, commercial-disclosure rules and definition of a good next action.

The first layer answers *what is currently true outside AQOON*. The second answers *how AQOON should help a family navigate it*. They must never be stored, reviewed or changed as if they were the same type of fact.

## Canonical homes

| Knowledge type | Canonical home | Use in the brain |
| --- | --- | --- |
| Business model, offers, outcome chain and trust boundaries | `business-operating-model.md` | sets the operating objective and prohibited shortcuts |
| Family and buyer communication rules | `workspaces/messaging/CONTEXT.md` | shapes explanation, CTA and disclosure language |
| Official sources, services, routes and calculators | `workspaces/evidence-and-research/references/` and protected knowledge tables | determines source-backed options and freshness |
| Case facts and consent | protected Supabase tables only | determines what can be matched for this family |
| Case outcomes and repeatable lessons | protected PII-free scenario records | improves questions and follow-up, never overwrites official rules |

This document is an index and integration contract. It does not replace the canonical documents above.

## What the operator co-pilot may use AQOON DNA for

- prioritise the smallest useful next action over a long generic list;
- explain an option in clear, human Somali/Finnish-appropriate language;
- show the exact missing facts before a route can be assessed;
- propose application preparation, reminders and follow-up;
- prompt for the correct separate consent before relevant updates, outcome follow-up or a partner handoff;
- disclose a paid provider relationship before a referral or recommendation;
- distinguish a verified match, an assisted action and a verified outcome;
- preserve a warm, non-judgmental tone when a family has missed a deadline or does not understand the system.

## What AQOON DNA may never override

- official eligibility, benefit amounts, residence/right-to-work decisions, programme admission, school/daycare placement, job offers or authority timelines;
- an expired, unverified or provider-only source;
- a family's explicit preferences, consent or refusal;
- the requirement for human review before a changed public-service rule is published or relied on in a case.

## Decision assembly order

`family facts + consent -> verified external route candidates -> AQOON safety/disclosure rules -> human explanation and next action -> operator review -> measured outcome`

The co-pilot must display its inputs separately. An operator must be able to see: the source-backed route, the family facts used, missing/contradictory facts, the AQOON guidance rule applied, and the authority/provider that remains the decision-maker.

## Internal policy-pack model

The protected database should eventually hold small, versioned references to these internal policy packs rather than copying large documents into every route:

| Pack | Examples | Review owner |
| --- | --- | --- |
| `family_navigation` | explain → compare → prepare → remind → guide; no promises | AQOON operations |
| `communication` | human tone, one useful fact, one clear next action, Somali terminology rules | content/operations |
| `consent_and_disclosure` | separate help, updates, outcome follow-up and partner-handoff permissions | operations/privacy owner |
| `commercial_neutrality` | best verified route first; paid relationship disclosed; no sale of contact lists | founder/operations |
| `outcome_evidence` | evidence threshold for application, start and persistence | operations |

A route records the policy-pack version(s) that govern its presentation. It does not embed mutable philosophy text. A policy change therefore creates a reviewable version and a targeted list of affected routes.

## Family-journey behaviour

At every stage, the brain should give the operator only what is useful now:

| Stage | Operator support |
| --- | --- |
| First contact | acknowledge the stated problem; capture consent and a safe callback route |
| Interview | ask only route-critical facts plus the minimal learning baseline |
| Route review | show verified possibilities, missing facts, official links and disclosure flags |
| Assisted action | prepare documents, explain the official step and set a concrete follow-up |
| Handoff | obtain the right consent; explain who receives what and why |
| Outcome/persistence | record evidence, not assumptions; turn only confirmed general lessons into a review candidate |

## Quality gate

No automation may publish, retire or materially alter either an external rule or an AQOON policy pack. Automation may detect a change, draft a comparison, identify affected routes and open a review task. A named human approves the final state with date, rationale and version history.
