# Stage 04 — change and test

## Inputs

The implementation plan and current source files.

## Process

Edit only the planned scope. For tracker source changes, regenerate the
checked-in bundle. Run the narrowest relevant tests first, then the repository
QA required by the root router. For Supabase changes, use a migration for DDL,
verify the function/schema state, and run a read-only post-change query.

## Outputs

The changed files, test commands, pass/fail results and any generated artifacts
that must be reviewed.
