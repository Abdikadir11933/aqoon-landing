# Legacy knowledge mapping — 2026-08-28

## Finding

AQOON already has 666 embedded knowledge chunks across domain-specific tables. They are a useful **discovery library**, not yet a verified routing database.

The domain-specific tables use the same record shape: source URL/slug, section heading, chunk text, embedding, fetch timestamp and content hash. `knowledge_chunks` is an older, more generic variant. None stores the route scope, matching criteria, decision-maker, verification state or recheck date required for reliable case matching.

## Safety classification

All existing chunks are `discovery_only` until a human verifies the underlying current primary source. The first inspection found records fetched in May 2026, including a retired `te-palvelut.fi` jobseeker URL. Therefore no existing embedding result may be shown as a confirmed match or current instruction.

## Mapping

| Legacy material | New role | Rule |
|---|---|---|
| source URL/slug | source candidate | deduplicate to one source record; confirm publisher, current URL and freshness |
| section/chunk text | research evidence | retrieve current primary page before extracting a service, route or criterion |
| embedding | discovery aid only | use to find candidates; never decide eligibility or freshness |
| domain table | topic hint | map to authority/service/route only after verification |
| old generic `knowledge_chunks` | historical import queue | do not merge automatically with domain tables |

## First import queue

1. `municipal_knowledge_chunks`: Vantaa hobbies/support references; refresh against current Vantaa pages, then create Vantaa service/route records.
2. `labor_knowledge_chunks`: retain labour-law sources where current; retire/replace TE Services sources with Työmarkkinatori and the responsible employment authority.
3. Kela/OPH/Migri chunks: verify one source family at a time before any family-case use.

## Database gate

Do not create a second vector store. The next protected data-model migration should add structured records for sources, services, routes, criteria, verification events and private match runs, while retaining legacy chunks as read-only discovery material. New records must have RLS enabled, no browser write path, and be accessed through authenticated operator Edge Functions only.
