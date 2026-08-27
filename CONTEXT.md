# AQOON Repository Context

## Purpose

AQOON helps Somali-speaking families and adults in Finland understand services, find the right official path and prepare the next action. This repository combines production code with public verified knowledge and AI routing instructions.

## Context model

Use the smallest useful context for the task:

1. Root router: where am I?
2. Workspace/router: where do I go?
3. Stage contract: what exactly do I do?
4. Canonical references: what facts are allowed?
5. Case/output: what is specific to this task?

Dependencies flow from official sources -> verified knowledge -> product/research/messaging outputs. Do not reverse that direction.

## Canonical truth rules

- One fact, one home.
- Do not treat old AQOON documents, programme directories, marketing copy or prior answers as proof of current public-service facts.
- `LOW` volatility may be reused until its review window expires.
- `MEDIUM` volatility should be periodically rechecked.
- `HIGH` and `LIVE` facts require current-source verification for each case or publication where the claim matters.
- A programme-directory entry means “candidate to investigate”, not “currently open”.

## Public/private boundary

Public repository allowed:
- product code
- schemas and QA rules
- public official/provider sources
- sanitized public knowledge records
- sanitized methodology/evidence

Keep outside public GitHub:
- family names, phones, emails, case notes, interview transcripts
- private buyer messages
- sales pipeline
- confidential commercial notes
- raw pilot material containing identifiable or confidential information

Family operational data belongs in Supabase/private systems.

## Safety model

AQOON may explain, navigate, compare, prepare, remind and help with applications. The final decision belongs to the relevant authority/provider/employer. A “confirmed match” means the published criteria checked at the stated time appear to match the known facts; it is not a promise of approval.

## Production areas

- `caawi/` parent-facing intake
- `tracker/` private CRM/command center
- `so/` Somali public guidance
- `pilke/` protected campaign pages
- B2B public pages at repository root and established route folders

## Shared knowledge

Read `_core/CONVENTIONS.md`, then only the policies/schemas needed for the task.
