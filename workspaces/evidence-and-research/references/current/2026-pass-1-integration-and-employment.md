# Pass 1 — integration and employment entry routes

Checked: 28 August 2026. Scope: first-contact navigation only. This pass does not determine entitlement, statutory obligations, benefit amounts, course availability, plan duration or immigration status.

## Verified routes added

- `route.employment.jobseeker-registration`: national official entry for a person who is unemployed, laid off or about to be, with a clear boundary between registering and any later unemployment-security decision.
- `route.vantaa.integration-needs-assessment-outside-labour-force`: Vantaa's official entry for residents outside the labour force, explicitly including a parent caring for a child at home.
- `route.employment.current` now carries the standing registration and employment-plan sources instead of relying only on a 2025 transition news item.

## Core routing rule

Do not use active-jobseeker registration as a generic proxy for integration help. An active jobseeker belongs in the employment-services flow; a Vantaa resident outside the labour force can be directed to Vantaa's competence and integration service-needs assessment. The responsible authority decides whether a plan or service follows.

## Operator minimum facts

Collect only what is needed to navigate: municipality; whether job search is active; start/expected unemployment date; whether an authority assessment or plan already exists; work/study goal; language/education needs; childcare/availability; and any authentication barrier. Treat this as preparation data, never as an AQOON eligibility decision.

## Remaining Pass 1 research debt

1. Verify the current statutory integration-period and plan-duration rules from the consolidated legislation and clear official guidance.
2. Build separate source-backed routes for work trials, integration training, study while unemployed, job-search duties, work-ability support and unemployment-security application/payment.
3. Add equivalent municipality-specific entry routes for Helsinki and Espoo before suggesting local contacts outside Vantaa.
4. Validate current language coverage, accessibility and appointment/contact mechanics at the time of an actual referral.

## Pass 1 acceptance result

The initial routing split and assessment/plan-content description are safe enough for operator navigation. It is **not** a complete employment, unemployment-security or integration-policy knowledge base; those items remain queued for Pass 2 and later research.
