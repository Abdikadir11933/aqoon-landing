# AGENTS.md — AQOON compatibility router

This file exists for agents that look for `AGENTS.md`. It is deliberately a router, not a second handbook.

## Required read path

1. Read `CLAUDE.md` for the task router and session bootstrap.
2. Read `CONTEXT.md` for repository-wide truth and safety boundaries.
3. Read the nearest task/folder `CONTEXT.md` and local `CLAUDE.md` only when relevant.
4. Load the relevant `.claude/skills/<skill>/SKILL.md` for repeatable workflows.
5. Use `docs/architecture/repo-map.md` when you need the full map.

Do not duplicate mutable implementation details here. The current code, database schema, Edge Functions, tests and nearest context files are authoritative for implementation state.

## Stable runtime map

- `/` plus `tapaus/`, `menetelma/`, `paketit/`, `havainnot/`, `sanasto/` — public organisation/content site
- `/caawi` — canonical Somali-first family site and intake; guidance lives at `/caawi/<topic>`; see `caawi/CONTEXT.md`
- `/tracker` — private operator command center; see `tracker/CONTEXT.md`
- `/so` — legacy redirect namespace only; never use it for new links, canonicals or content
- `/pilke` and `/pilke/so` — protected campaign pages; do not modify without explicit instruction

## Stable private-data boundary

Family operational data belongs in protected Supabase-backed systems, never public repository documents or anonymous analytics. The tracker uses authenticated server-side Edge Functions; do not introduce direct browser database writes or expose service-role credentials.

Reusable scenario knowledge is PII-free and separate from family interviews. Personal case facts remain private; generalized verified routes may be reused only while their verification window is current.

## Non-negotiables

- Never commit secrets, tracker passwords, family PII, private messages or confidential partner/buyer material.
- Never put a Supabase service-role key in frontend code or GitHub.
- Keep `/tracker` `noindex,nofollow,noarchive`, disallowed in `robots.txt`, and uncached.
- Current eligibility, deadlines, fees, programmes, benefits and procedures require current official/provider verification.
- AQOON explains and routes; it does not make authority/provider/employer decisions.
- Read `BRAND.md` before visual changes and preserve working UI/UX unless the task explicitly calls for redesign.
- Do not touch Pilke as collateral work.

## Completion

Run the relevant QA and tests. For production work, verify the intended Vercel commit is READY before saying the change is live. For Supabase work, verify migration/function state and privacy controls.
