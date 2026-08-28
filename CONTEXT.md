# AQOON Repository Context

## Purpose

AQOON is a demand-to-outcome company. On the family side it provides a trusted, low-friction way to understand services and opportunities, find the right route and complete the next action. On the buyer side it helps organisations turn otherwise missed demand into measurable applications, starts, customers and sustained participation.

AQOON starts from Somali-language and multilingual service gaps because that is where its strongest current distribution, trust and evidence exist. That entry wedge must not be confused with the permanent limit of the model: the underlying failure - a person does not discover, understand, trust or complete a useful route - is wider than one language or background.

## Context model

Use the smallest useful context for the task:

1. Root router: where am I?
2. Workspace/router: where do I go?
3. Stage contract: what exactly do I do?
4. Canonical references: what facts are allowed?
5. Case/output: what is specific to this task?

Dependencies flow from official sources -> verified knowledge -> product/research/messaging outputs. Do not reverse that direction.

The operating model flows as:

`useful content/free help -> consented contact -> interview/qualification -> verified match -> assisted action -> partner handoff -> verified outcome/persistence -> aggregate learning`

See `docs/architecture/business-operating-model.md` for the canonical business model. Do not duplicate or reinterpret it independently in feature-level files.

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

AQOON does not sell family contact lists. Commercial relationships and paid recommendations must be disclosed to the family at the relevant decision point. Consent to receive help is not consent to share data with a buyer or to market unrelated products.

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
