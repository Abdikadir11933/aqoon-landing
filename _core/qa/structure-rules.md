# Structure QA

1. Every task has an unambiguous router.
2. Root docs route; they do not duplicate detailed domain knowledge.
3. Reusable facts have stable canonical IDs.
4. Stage outputs are explicit handoffs to the next stage.
5. Case-specific outputs never become reference truth automatically.
6. Production routes stay physically stable unless a tested route migration is explicit.
7. `pilke/` remains untouched unless explicitly requested.
