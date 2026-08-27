# `/caawi` context

Purpose: public Somali intake that gets contact details first, then enough structured information to route the person correctly.

## Product contract

- Mobile-first.
- Phone + name first.
- Do not redesign the current flow unless explicitly requested.
- Keep language natural, modern and easy to understand.
- Finnish service names such as Kela, päiväkoti, esiopetus, YKI and Työmarkkinatori may stay in Finnish when that is what the user will encounter in real life.
- Never promise eligibility, acceptance, a benefit, a legal outcome or a specific programme place.

## Data contract

- Contact save: `family-intake-contact`.
- Final intake: `family-intake-submit`.
- Anonymous funnel events: `family-funnel-track`.
- No Supabase database/service-role key in browser code.
- Never put PII in anonymous funnel events.
- `intake_request_id` is the duplicate-protection key for final lead creation.

## Canonical dependencies

When copy describes a service, programme, benefit or rule, source it from `knowledge/` rather than treating `caawi/app.js` as the knowledge database.

## QA before publish

1. Phone validation works for Finland numbers.
2. First contact save succeeds before later questions.
3. Back/exit protection does not destroy entered contact details unexpectedly.
4. All selectable needs route to a valid final submission.
5. No duplicate lead from a single `intake_request_id`.
6. Somali copy is understandable without bureaucratic or machine-translated wording.
7. `/caawi` remains `no-store`.
