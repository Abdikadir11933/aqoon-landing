# AQOON

AQOON helps Somali-speaking families in Finland find, understand and take the next step into useful services. I built this platform to support the work around that journey: collecting a request, understanding the need, following up and recording what actually happened.

**Built by [Abducadir Aligure](https://www.linkedin.com/in/abducadir-abdullahi-aligure-b1119033a), a founder with a background in logistics, customer-facing work and AI-assisted software development.**

[Public website](https://aqoon.live) · [Family service](https://aqoon.live/caawi) · [Project walkthrough and code example](docs/showcase.md) · [Public customer case study](https://aqoon.live/tapaus)

## What I built and why

Families can get stuck before they reach a service: they may not know it exists, understand the application or know what to do next. My work combines speaking with families, delivering client projects and building the tools used to support that process.

| Part of the platform | What it supports | Implementation |
|---|---|---|
| Somali-first intake | A short request with contact details and one or more needs; detailed questions come later | [Caawi](caawi/) |
| Operator tracker | Interviews, call history, next actions and follow-up across a family's needs | [Tracker](tracker/) |
| Backend and data contracts | Server-side operations, recorded consent and the relationships between contacts, people and cases | [Implementation](supabase/) · [Data contract](docs/architecture/tracker-supabase-data-contract.md) |
| Quality checks | Regression tests for intake and operational behaviour, plus route, context and accessibility checks | [Tests](tests/) · [CI workflow](.github/workflows/site-qa.yml) |

The frontend uses HTML, CSS and JavaScript, with Supabase for backend services and Vercel for hosting. Node.js and Python run the automated checks.

## A quick walkthrough

![Five-step fictional example: a request for a Finnish course moves through intake, interview, a verified next action, follow-up and a recorded outcome.](docs/showcase-workflow.svg)

The illustration uses an invented scenario, not production records or screenshots. Read the [walkthrough](docs/showcase.md) for the connection between each step and the code, including a tested safeguard against duplicate form submissions. The operator tracker requires authorised access; the walkthrough can be reviewed without an account or a live form submission.

## How I use AI, and what I am learning

I use Claude Code to build and iterate on the platform. My contribution includes understanding the customer problem, deciding what the workflow needs to do and reviewing the result against real use. The repository records the [AI-assisted development process](workspaces/ai-coding/CONTEXT.md), with scoped instructions, implementation review and tests.

Two lessons shape the work: an intake should collect enough information to start a useful conversation, and a saved contact is different from a completed application or a verified outcome. Those distinctions matter to both the person asking for help and the organisation paying for the service. The [showcase](docs/showcase.md) explains one concrete implementation decision and the limits of its test evidence.

**Project scope:** this repository contains the AQOON website, intake and operator platform. AqoonPRO, my separate Finnish-letter explanation application, is currently private. Its model routing and output-validation pipeline are not demonstrated by this repository. Here, the AI evidence is the development workflow and the software built with it.

## Run a static preview and the checks

For the same tool versions used in CI, use Python 3.12 and Node.js 22. From a clean checkout:

```sh
git clone https://github.com/Abdikadir11933/aqoon-landing.git
cd aqoon-landing
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/` for the public website. This is a static preview, not an isolated working copy of the backend: Vercel routing and authenticated operator behaviour are not reproduced, and frontend code still contains production API endpoints. Use the fictional walkthrough and local tests to explore the service workflow; do not submit test records through the preview or request production credentials.

Run these checks from a second terminal in the repository root:

```sh
python scripts/context_qa.py
python scripts/repo_integrity_qa.py
node --test tests/caawi.test.js tests/call-outcomes.test.js
git diff --check
```

The two Node test files above run local assertions and mocked requests without a live backend. The [CI workflow](.github/workflows/site-qa.yml) defines the full regression and static-check suite. [Testing guidance](TESTING-SUMMARY.md) explains what those checks establish and what still needs authenticated runtime verification.

## Maintainer navigation

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

## Context portability

[.claude/skills/](.claude/skills/) owns each skill once. [.agents/skills/](.agents/skills/) provides symlinked discovery for Codex. `CONTEXT.md` files are explicit task references, not automatically loaded instructions in every agent. A folder structure helps navigation; it does not grant access, enforce permissions or guarantee an agent has read a file.

This is a public repository. Private interviews, buyer correspondence, commercial planning and credentials belong in authorized private systems. See [CONTEXT.md](CONTEXT.md) for the boundary.
