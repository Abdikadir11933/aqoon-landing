# Stage 04 — change and test

## Inputs

The implementation plan and current source files.

## Process

Edit only the planned scope. When tracker source CSS changes, regenerate
`tracker/bundle.css` using `scripts/build_tracker_bundle.js`. JavaScript stays
explicitly loaded through `tracker/index.html`; never restore `bundle.js`.
Run the narrowest relevant tests first, then the repository
QA required by the root router. For Supabase changes, use a migration for DDL,
verify the function/schema state, and run a read-only post-change query.

## Outputs

The changed files, test commands, pass/fail results and any generated artifacts
that must be reviewed.
