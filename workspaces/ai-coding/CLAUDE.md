# AI coding workflow router

Read `CONTEXT.md`, then only the stage contract needed for the current change.

Use this workspace for repository changes made with an AI coding agent. Keep
the task bounded, preserve production route contracts, and treat the current
implementation plus live data contract as authoritative.

The required handoff is:

`brief -> impact map -> plan -> implementation -> QA evidence -> human review`

Do not treat a generated plan, an old audit or a model response as proof that a
feature exists. For tracker work, inspect the browser code, Edge Function,
Supabase schema and relevant tests together.
