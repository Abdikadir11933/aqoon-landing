# AQOON

AQOON connects people with useful services through trusted explanation, practical navigation and support through the next action. This repository contains the public website, Caawi intake, authenticated tracker, Supabase implementation and the context used to maintain them.

## Start here

Humans: use the task table below. Agents: start with [AGENTS.md](AGENTS.md), follow [CLAUDE.md](CLAUDE.md), then load only the context needed for the task. The [repository map](docs/architecture/repo-map.md) explains ownership; the [context workflow](docs/architecture/context-workflow.md) explains instructions, evidence, updates and handoffs.

| I want to… | Starting point |
|---|---|
| Understand what AQOON offers | [Business model](docs/architecture/business-operating-model.md) |
| Understand what has actually been demonstrated | [Evidence index](workspaces/evidence-and-research/references/aqoon-evidence-index.md) |
| Critique the homepage and buyer journey | [Website review skill](.claude/skills/website-review/SKILL.md) |
| Assess opportunities, positioning or business viability | [Strategy context](workspaces/strategy/CONTEXT.md) |
| Plan a video, campaign or community outreach | [Messaging context](workspaces/messaging/CONTEXT.md) |
| Change the family site | [Caawi context](caawi/CONTEXT.md) |
| Change operator workflows | [Tracker context](tracker/CONTEXT.md) |
| Implement a code or data change | [Coding stages](workspaces/ai-coding/CONTEXT.md) |
| Check repository structure | [Repository audit skill](.claude/skills/repository-auditing/SKILL.md) |

## Working locally

The web application is static HTML, JavaScript and CSS hosted on Vercel; do not assume a Next.js build. For static preview, run `python -m http.server 8000` from the repository root. This preview does not reproduce Vercel rewrites, Edge Functions, authentication or production data.

For context and repository integrity changes:

```sh
python scripts/context_qa.py
python scripts/repo_integrity_qa.py
git diff --check
```

Runtime checks are defined in [.github/workflows/site-qa.yml](.github/workflows/site-qa.yml). Choose the checks that exercise the changed behavior; CI runs the full required suite. Never use live family records as test fixtures.

## Context portability

[.claude/skills/](.claude/skills/) owns each skill once. [.agents/skills/](.agents/skills/) provides symlinked discovery for Codex. `CONTEXT.md` files are explicit task references, not automatically loaded instructions in every agent. A folder structure helps navigation; it does not grant access, enforce permissions or guarantee an agent has read a file.

This is a public repository. Private interviews, buyer correspondence, commercial planning and credentials belong in authorized private systems. See [CONTEXT.md](CONTEXT.md) for the boundary.
