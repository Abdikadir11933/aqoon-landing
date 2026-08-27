# Full repository audit — 2026-08-27

Scope: architecture, context routing, Claude Code ergonomics, runtime code, privacy/security, Supabase integration boundaries, SEO/discoverability, CI, tests and deployment hygiene. Protected Pilke pages and visual redesign were intentionally excluded from modification.

## Strengths found

- Root `CLAUDE.md` + `CONTEXT.md`, `_core/`, workspaces and stage contexts already implement progressive-disclosure context well.
- Production routes are separated from research/governance folders.
- Tracker privacy and intake server-side validation have explicit contracts.
- Public SEO already has sitemap, robots, canonicals, metadata checks and curated link verification.
- Existing CI covers route, usability, legal/trust, language and intake regression checks.

## Gaps fixed in this audit

1. `AGENTS.md` had become a second detailed handbook and could drift from current code/database state. It is now a compatibility router.
2. There was no `.claude/skills/` layer for repeatable bootstrapping, full audits, SEO/growth, family research and release verification. Added.
3. The “first task” read routine was implicit. Root `CLAUDE.md` now defines a deterministic session bootstrap.
4. Repository map was missing on master. Added `docs/architecture/repo-map.md`.
5. `.gitignore` only ignored Vercel state. Added local secret, Claude-local, dependency, cache and log exclusions.
6. Newly added tracker scenario-learning JavaScript was not covered by CI syntax checks. Added coverage.
7. Static SEO metadata checker existed but was not part of the primary site QA workflow. Added it.
8. Scenario learning was dynamically injected by another JavaScript file, making load order harder to reason about. It is now a direct deferred script dependency in tracker HTML, with no visual redesign.
9. Added deterministic repository-integrity QA to keep the context/skills/load-order/privacy architecture from silently regressing.
10. Added explicit SEO ownership rules so the curated link manifest is not mistaken for canonical factual truth.

## External blocker observed

The latest master commit before this audit had a Vercel failure status caused by the account build-rate limit, not a reported source-code build error. Production must be checked again after this audit commit; do not describe the latest frontend changes as live until Vercel serves the intended SHA in READY state.

## Deliberately not changed

- Pilke campaign pages.
- Existing tracker visual design, CRM card layout, dashboard layout or analytics layout.
- Existing public-site visual language.
- Broad content/keyword rewrites without evidence of a real search-intent or factual need.
- Working `family-leads-admin` behavior simply for architectural cleanliness.
