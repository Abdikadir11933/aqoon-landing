# CLAUDE.md — AQOON repository operating rules

Read `CONTEXT.md` first. This repo uses progressive disclosure: root rules route you to the nearest folder-level `CONTEXT.md`, canonical `knowledge/` records, then dated `research/` evidence only when needed.

## Non-negotiable boundaries

### Protected Pilke campaign pages

Do not modify:

- `pilke/index.html`
- `pilke/so/index.html`

or their campaign behavior/styles unless the owner explicitly asks for Pilke changes. A repo-wide refactor is not permission to touch them.

### Public repository privacy

Never commit:

- family names, phone numbers or case histories
- interview answers or free-text family PII
- tracker plaintext password
- Supabase service-role keys
- private email/messages
- confidential partner/customer material

`internal/`, `working/`, `research/`, `references/` and `knowledge/` are all still public GitHub content.

### Official-information safety

AQOON explains and routes. It is not Kela, a municipality, an employment authority, a school, Migri, legal counsel or another public authority.

Do not invent or guarantee:

- eligibility/entitlement
- acceptance to a programme or school
- benefit amount
- deadline exception
- legal conclusion
- authority decision

Current programmes, deadlines, benefit rules, service names, fees and application procedures must be verified against a live official source before publication or operator use.

## Repository architecture

Canonical architecture and stage contracts live in `CONTEXT.md`.

Important local contexts:

- `caawi/CONTEXT.md` — public Somali intake
- `tracker/CONTEXT.md` — private operator CRM/analytics
- `so/CONTEXT.md` — Somali public knowledge pages
- `knowledge/CONTEXT.md` — canonical facts and source governance
- `research/CONTEXT.md` — evidence-gathering workflow
- `operations/QA.md` — content + implementation QA and deploy verification

The runtime route folders stay where Vercel expects them. The architectural rebuild is about canonical ownership and context, not moving production URLs merely for neatness.

## B2B public site

Main routes:

- `index.html`
- `tapaus/index.html`
- `menetelma/index.html`
- `paketit/index.html`

Shared visual rules: read `BRAND.md` before UI work. Keep existing redirects in `vercel.json` unless the owner explicitly changes URL strategy.

## `/caawi`

Phone/name first is intentional. Keep server-side validated intake through Supabase Edge Functions. No direct browser database writes. Do not redesign the current working flow unless explicitly requested.

## `/tracker`

Private/noindex operator tool. Data is live from protected Supabase APIs. Do not restore the retired localStorage/WhatsApp-parser lead database. Never mix anonymous funnel metrics with CRM lead counts.

## `/so`

Use natural modern Somali, short/direct sentences and familiar Finnish service names where that helps real-world recognition. Production page copy is a presentation surface, not the canonical source of truth.

## Working method

For substantial knowledge/site work use the stage order defined in `CONTEXT.md`:

discover → map → define canonical homes/schemas → scaffold → migrate/audit → verify live sources → add missing research → content QA → implementation QA → publish.

For large Finland-wide knowledge releases, run three separate content audits before the final deployment as defined in `operations/QA.md`.

## Deployment

Vercel is static with clean URLs. When the owner has explicitly requested deployment, deploy and verify the exact intended Git commit is the READY production deployment. Do not report a GitHub commit as live without production verification.
