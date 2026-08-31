# Stage 02 — impact map

## Inputs

The task brief plus the nearest `CONTEXT.md` and `CLAUDE.md` files.

## Process

Trace the current runtime path before editing: entry route, loaded assets,
server or Edge Function calls, database collections, migrations, tests and
deployment path. Mark each item as source, generated, live data or evidence.

For Supabase-backed work, compare referenced collection names and columns with
the live schema. Do not use an old document as a substitute for that check.

## Outputs

An impact map with affected files, runtime path, data contract, protected
boundaries and the exact verification needed.
