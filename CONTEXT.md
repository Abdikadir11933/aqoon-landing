# AQOON repository context router

This repository serves two jobs at once:

1. a production website and operator tooling, and
2. a governed knowledge system for finding, verifying and explaining Finnish services, programmes, benefits, rights, calculators and official links.

Use progressive disclosure. Start here, then load only the context for the area you are changing.

## Read order

1. `CONTEXT.md` — this router.
2. `CLAUDE.md` — non-negotiable repo rules and protected areas.
3. The nearest folder-level `CONTEXT.md` for the work area.
4. Canonical knowledge records under `knowledge/` when making factual service/programme/benefit claims.
5. `references/` only when source material is needed.
6. `working/` only for temporary research/audit artifacts. Never treat working notes as canonical truth.

## Production areas

- `/` + `tapaus/`, `menetelma/`, `paketit/`: B2B public site.
- `caawi/`: Somali parent/adult intake. Read `caawi/CONTEXT.md`.
- `tracker/`: private operator command center. Read `tracker/CONTEXT.md`.
- `so/`: Somali public knowledge/help experience. Read `so/CONTEXT.md`.
- `pilke/`: protected campaign pages. Do not modify unless the owner explicitly asks.

## Knowledge system

- `knowledge/CONTEXT.md`: rules for canonical knowledge.
- `knowledge/schemas/`: record contracts.
- `knowledge/canonical/`: reviewed reusable facts and service records.
- `knowledge/language/`: Somali/Finnish terminology and writing rules.
- `knowledge/link-bank/`: official-link catalogue and calculator catalogue.
- `research/`: source-verification plans and dated research outputs.
- `references/`: external/source artifacts kept for traceability.
- `working/`: temporary drafts, extraction notes, comparisons and audits.
- `operations/`: deployment, QA and maintenance playbooks.

## Canonical-home rule

Every durable fact has one canonical home. Pages may render or summarize it, but should not become the only place where the fact exists.

- evergreen service explanation → `knowledge/canonical/services/`
- benefit/rule/eligibility logic → `knowledge/canonical/benefits/` or `knowledge/canonical/rules/`
- programme/opportunity with dates → `knowledge/canonical/programmes/`
- city-specific implementation → `knowledge/canonical/cities/`
- official URL → `knowledge/link-bank/official-links.md`
- calculator/tool → `knowledge/link-bank/calculators.md`
- translation/term decision → `knowledge/language/`
- research evidence → `research/` or `references/`, never directly as production truth

## Evidence rule

A claim is not trusted because it already exists in the repo. Current programmes, deadlines, benefits, eligibility conditions, fees, contact routes and official procedures must be checked against a live official source before publication or operator use.

Each time-sensitive record should carry:

- source URL
- source owner
- checked date
- claim status
- expiry/recheck date when relevant
- exact scope/city/audience
- notes on what AQOON may and may not conclude

## Privacy boundary

This is a public GitHub repository. Never commit family names, phone numbers, case histories, interview answers, tracker passwords, private email threads, Supabase service-role keys or confidential partner/customer material.

Production family data belongs in the protected Supabase-backed workflow, not in repository documents.

## Stage contracts

Research and implementation are separate stages:

1. Discover — inventory what exists.
2. Map — decide ownership and dependencies.
3. Define — create canonical homes and schemas.
4. Scaffold — create folders/context contracts.
5. Migrate/audit — move or reconcile reusable knowledge.
6. Verify — check live official sources.
7. Expand — add missing coverage.
8. QA content — factual completeness, contradictions, provenance.
9. QA implementation — routes, UX, security, accessibility, deployment.
10. Publish — only after both QA passes.

Do not skip verification by copying an old AQOON claim into a new canonical file.
