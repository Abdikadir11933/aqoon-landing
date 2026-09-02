# AQOON repository map

This map explains ownership. It does not authorize moving production routes.

## Read path

`CLAUDE.md` → `CONTEXT.md` → nearest local/workspace context → matching `.claude/skills/` procedure → current source/data contract.

The goal is progressive disclosure: an agent should not need the entire repository in context to do one task.

## Runtime surfaces

| Path/folder | Role | Local contract |
|---|---|---|
| `/` + `tapaus/`, `menetelma/`, `paketit/`, `havainnot/`, `sanasto/` | Public B2B site for selected buyers, organisations and partners | root context + `BRAND.md` for UI |
| `caawi/` | Canonical Somali-first family site: intake at `/caawi`, guidance/SEO at `/caawi/<topic>`, hub at `/caawi/xog` | `caawi/CONTEXT.md` |
| `tracker/` | Private operator CRM/research command center | `tracker/CONTEXT.md` |
| `/so/*` | Legacy permanent redirects to the matching `/caawi/*` route; no canonical files | ADR 0004 + `vercel.json` |
| `pilke/` | Protected campaign pages | explicit owner instruction required |
| `assets/` | Shared public-site assets | root/brand contracts |

Do not move these physical paths just to make the repository visually tidier; they are production route contracts. The `/so` to `/caawi` migration is the explicit, redirect-preserving exception recorded in ADR 0004.

## Agent/governance layer

| Folder/file | Ownership |
|---|---|
| `CLAUDE.md` | Small root router and session bootstrap |
| `CONTEXT.md` | Stable repository-wide truth/safety context |
| `AGENTS.md` | Compatibility router only; must not become a second handbook |
| `.claude/skills/` | Repeatable procedures loaded on demand |
| `_core/` | Shared conventions, policies, schemas and QA rules |
| `docs/architecture/` | Architecture maps and rationale |
| `docs/decisions/` | Durable architecture decisions |
| `docs/briefs/` | Goal-driven implementation briefs; planned state must be labelled clearly |
| `docs/qa/` | Point-in-time audit records |

## Research and knowledge workspaces

- `workspaces/family-research/` — case research stages and routing workflow; family PII still stays out of GitHub.
- `workspaces/evidence-and-research/` — sanitized sources, evidence and verification records.
- `workspaces/messaging/` — copy/messaging task context. Its canonical acquisition reference is `references/aqoon-demand-generation-and-content-os.md`.
- `.claude/skills/aqoon-demand-content/` — repeatable workflow for campaigns, videos, scripts, trusted connectors, creators, järjestöt and performance review.
- `workspaces/product-qa/` — site/repository QA context.
- `workspaces/ai-coding/` — staged AI-assisted coding workflow with explicit handoffs.

`internal/` is a historical name, not a security boundary. This repository is public; anything under `internal/` must still be safe for public GitHub.

## SEO and discovery

- `seo/CONTEXT.md` — discoverability/growth operating rules.
- `seo/verified-links.json` — curated link-test/discovery manifest, not canonical truth for every claim.
- `sitemap.xml` — indexed canonical routes.
- `robots.txt` — crawler controls.
- `llms.txt` — AI-readable public navigation.

## Quality and automation

- `scripts/` contains deterministic QA, legal/trust, SEO, route, language and usability checks.
- `.github/workflows/` runs those checks and scheduled link verification.
- `tests/` contains regression tests for critical runtime flows.

Prefer adding a deterministic check when a rule can be tested automatically; prose reminders are the fallback.

## Private operational systems

Supabase is the source of truth for family operational data. Personal interviews remain private. Reusable scenario knowledge is generalized and PII-free. Browser code must not contain service-role credentials or expose family data through unauthenticated reads.

The canonical business model is `docs/architecture/business-operating-model.md`. The current two-operator evolution brief is `docs/briefs/aqoon-two-operator-os-v2-fast-start.md`. The concrete field-by-field inventory of the public intake and first interview, and how each currently-seeded verified route resolves its required facts against them, is `docs/architecture/interview-and-intake-field-reference.md`. Neither file overrides runtime truth: tracker behaviour is what the deployed code, Edge Functions and production schema actually implement.
The tracker-to-database collection contract is `docs/architecture/tracker-supabase-data-contract.md`; it is checked statically by `scripts/tracker_collection_qa.js`, while database changes still require live schema verification.

Vercel hosts the public/static application. A Git commit is not equivalent to a production release; the intended commit must be deployed and READY before it is described as live.

The canonical public-surface boundary is recorded in `docs/decisions/0004-caawi-family-canonical-home.md`.
