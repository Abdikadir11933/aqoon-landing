# AQOON Repository Router

This repository is a context-routing operating system, not a single handbook. Keep root memory small; route work to the nearest context and skill.

## Session bootstrap — every new repo task

Before substantive work:

1. Read `CONTEXT.md`.
2. Classify the task with the routing table below.
3. Read only the nearest relevant `CONTEXT.md` and local `CLAUDE.md` if one exists.
4. Load the matching `.claude/skills/<skill>/SKILL.md`. For broad or ambiguous work, start with `session-bootstrap`.
5. Inspect the current implementation, data contract, and tests before editing. Never infer current behavior from an old plan or prior answer.
6. Identify protected boundaries and the verification needed before making changes.
7. Reuse context already read in the same task; do not repeatedly reload the whole repository.

## Task routing

| Task | Go to |
|---|---|
| Parent-facing intake | `caawi/CONTEXT.md` |
| Family CRM / tracker | `tracker/CONTEXT.md` |
| Somali public guidance | `so/CONTEXT.md` |
| Research a family case | `workspaces/family-research/CONTEXT.md` + `family-research` skill |
| Verify evidence or an external claim | `workspaces/evidence-and-research/CONTEXT.md` |
| Messaging / website / sales copy | `workspaces/messaging/CONTEXT.md` |
| SEO / discoverability / content growth | `seo/CONTEXT.md` + `seo-growth` skill |
| Site-wide or repository audit | `workspaces/product-qa/CONTEXT.md` + `repository-auditing` skill |
| Production release / deploy verification | `production-releasing` skill |
| Shared rules and schemas | `_core/CONVENTIONS.md` |
| AI-assisted code or data change | `workspaces/ai-coding/CONTEXT.md` |
| Repository map | `docs/architecture/repo-map.md` |
| Pilke campaign | PROTECTED — only when explicitly requested |

## Non-negotiable boundaries

- Public GitHub contains product code, public verified knowledge, routing rules and sanitized evidence only.
- Family PII, interview notes, phone numbers and case history stay in private systems such as Supabase.
- Confidential sales, buyer conversations, pilot raw notes and commercial strategy do not belong in this public repository.
- Every reusable fact has one canonical home. Other files link to it rather than creating competing truth.
- High-volatility and live facts must be rechecked from the current official/provider source before case-specific advice or publication.
- AQOON can explain, navigate, compare, prepare and help a user apply. AQOON does not decide legal eligibility, benefits, permits, school/daycare placement, jobs, grants or authority outcomes.
- Never touch `pilke/` unless the user explicitly asks for Pilke work.
- Do not redesign a working UI as a side effect of architecture, data, SEO or QA work.

## Production-route safety

Do not move production routes merely to make the repository look cleaner. `/caawi`, `/tracker`, `/so`, `/pilke` and the current B2B pages keep their physical paths unless a route migration is explicitly planned and tested.

## UI changes

Read `BRAND.md` before visual changes. Preserve accessibility, mobile behavior, interaction contracts and existing working flows. Prefer additive, isolated changes over broad rewrites.

## Verification contract

A change is not complete because it compiles or commits. Run the relevant deterministic checks, inspect failures, and verify the deployed commit when deployment is part of the task. Never call a change “live” until the intended Vercel deployment is READY. For Supabase changes, verify RLS/auth boundaries and the deployed Edge Function or migration state.
