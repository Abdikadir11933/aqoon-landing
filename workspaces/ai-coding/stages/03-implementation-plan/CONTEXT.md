# Stage 03 — implementation plan

## Inputs

The task brief reflecting the user's authorized scope and the impact map.
An additional approval is not required merely to enter this stage.

## Process

Choose the smallest reversible change that satisfies the acceptance checks.
Prefer additive changes, existing helpers and existing route contracts. If a
schema change is required, define the migration and its RLS/auth verification
before touching production. Separate mechanical edits from judgment-heavy
content or business-model decisions.

## Outputs

A numbered plan with file-level edits, data changes, tests, rollback or recovery
notes, and a human checkpoint when the decision is material.
