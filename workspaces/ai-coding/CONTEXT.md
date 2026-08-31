# AQOON AI coding context

This workspace applies the Interpretable Context Methodology (ICM) idea to
AQOON without moving production routes or turning the repository into a
framework-specific agent project. The folders make the work sequence visible;
the repository and deployed services remain the source of truth.

## When to use it

Use this route for a code, schema, Edge Function, QA or deployment change that
needs a repeatable AI-assisted workflow. Small typo-only edits may use the
root router directly.

## Stage order

1. `stages/01-task-brief/CONTEXT.md` — define the requested outcome and scope.
2. `stages/02-impact-map/CONTEXT.md` — identify files, routes, data and boundaries.
3. `stages/03-implementation-plan/CONTEXT.md` — choose the smallest safe change.
4. `stages/04-change-and-test/CONTEXT.md` — edit, build and run deterministic checks.
5. `stages/05-evidence-review/CONTEXT.md` — inspect the diff and runtime evidence.
6. `stages/06-human-handoff/CONTEXT.md` — record what changed and what remains.

Each stage must state Inputs, Process and Outputs. A stage may stop for human
review; later stages must not be implied to have happened.

## AQOON-specific rules

- Keep family PII and private sales material out of GitHub.
- Treat Supabase as operational truth for tracker data.
- For tracker changes, verify the browser-to-Edge-Function path and the live
  collection contract; do not invent a parallel local collection.
- Use `apply_patch` for edits and regenerate `tracker/bundle.*` when source
  tracker assets change.
- Never call a change deployed until the intended production commit is READY.
- One canonical home per rule; link to it instead of copying mutable policy.

## Handoff format

Every completed change should leave:

- the task and scope;
- affected files, routes and collections;
- the implementation and tests run;
- known limitations or follow-up work;
- the commit/deployment identifier when applicable.
