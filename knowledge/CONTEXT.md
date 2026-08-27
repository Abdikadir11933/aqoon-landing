# Knowledge context

`knowledge/` is the canonical reusable knowledge layer for AQOON. It is not a dumping ground for research notes.

## Load order

1. This file.
2. The relevant schema in `knowledge/schemas/`.
3. The relevant canonical domain folder.
4. The official link/calculator bank if the task involves navigation.
5. Dated evidence in `research/` only when verification is needed.

## Status model

Every durable knowledge record should make its status obvious:

- `verified`: checked against a current official source.
- `needs_recheck`: was once useful, but current truth is not confirmed.
- `draft`: incomplete working record, not for publication.
- `retired`: historical/obsolete route retained only for traceability.

Do not publish a `draft`, `needs_recheck` or `retired` claim as current fact.

## Facts vs guidance

Separate:

- what the authority says,
- what AQOON explains in plain Somali/Finnish,
- what the operator should ask/check,
- what remains unknown for an individual case.

AQOON may explain and route. AQOON must not invent entitlement, legal conclusions, acceptance decisions or guaranteed outcomes.

## Time-sensitive material

Programmes, deadlines, fees, benefit amounts, application windows and current service names are volatile. They require a checked date and recheck policy.

## Duplication rule

If the same official URL, programme, calculator or rule is referenced in multiple pages, update the canonical record first. Production pages should be treated as presentation surfaces, not independent databases.
