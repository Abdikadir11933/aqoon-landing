---
name: session-bootstrap
description: Bootstrap work in the AQOON repository at the start of a new task or when scope changes. Use to load only the smallest relevant context, identify protected boundaries, inspect the current implementation, and define verification before editing.
---

# Session bootstrap

1. Read root `CONTEXT.md` and the routing table in root `CLAUDE.md`.
2. Classify the task: intake, tracker, Somali guidance, family research, evidence, messaging, SEO, QA, or release.
3. Read only the nearest relevant folder/workspace `CONTEXT.md` and local `CLAUDE.md` if present.
4. Load one or more task skills only when they match the work.
5. Inspect the current source files, tests and external system state that the task actually depends on.
6. Write down the protected boundaries mentally before editing: PII/secrets, Pilke, production routes, working UI/UX, official-source claims.
7. Decide how success will be verified before changing code.
8. Prefer a focused patch over a broad rewrite. Do not reorganize runtime paths merely for aesthetic cleanliness.
9. At completion, run the relevant deterministic checks and verify deployment state if production is involved.

Do not repeatedly reload the full repository in the same task. Progressive disclosure is part of the architecture.
