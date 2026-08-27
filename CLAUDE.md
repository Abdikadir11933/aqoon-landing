# AQOON Repository Router

This repository is a context-routing operating system, not a single handbook.

## Start here

Read `CONTEXT.md` first.

## Task routing

| Task | Go to |
|---|---|
| Parent-facing intake | `caawi/CONTEXT.md` |
| Family CRM / tracker | `tracker/CONTEXT.md` |
| Somali public guidance | `so/CONTEXT.md` |
| Research a family case | `workspaces/family-research/CONTEXT.md` |
| Verify evidence or an external claim | `workspaces/evidence-and-research/CONTEXT.md` |
| Messaging / website / sales copy | `workspaces/messaging/CONTEXT.md` |
| Site-wide QA | `workspaces/product-qa/CONTEXT.md` |
| Shared rules and schemas | `_core/CONVENTIONS.md` |
| Pilke campaign | PROTECTED — only when explicitly requested |

## Non-negotiable boundaries

- Public GitHub contains product code, public verified knowledge, routing rules and sanitized evidence only.
- Family PII, interview notes, phone numbers and case history stay in private systems such as Supabase.
- Confidential sales, buyer conversations, pilot raw notes and commercial strategy do not belong in this public repository.
- Every reusable fact has one canonical home. Other files link to its ID rather than copying the claim.
- High-volatility and live facts must be rechecked from the current official/provider source before case-specific advice.
- AQOON can explain, navigate, compare, prepare and help a user apply. AQOON does not decide legal eligibility, benefits, permits, school/daycare placement, jobs, grants or authority outcomes.
- Never touch `pilke/` unless the user explicitly asks for Pilke work.

## Production-route safety

Do not move production routes merely to make the repository look cleaner. `/caawi`, `/tracker`, `/so`, `/pilke` and the current B2B pages keep their physical paths unless a route migration is explicitly planned and tested.

## UI changes

Read `BRAND.md` before visual changes. Preserve accessibility, mobile behavior and existing route contracts.

## Deploy

Vercel is the production host. A task is not complete merely because code is committed: verify that the intended commit is deployed and READY before calling it live.
