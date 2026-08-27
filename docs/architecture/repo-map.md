# AQOON repository map

## Production surfaces

| Surface | Route/files | Owns | Does not own |
|---|---|---|---|
| B2B site | `/`, `tapaus/`, `menetelma/`, `paketit/` | public company story/offer | family service truth |
| Intake | `caawi/` | contact-first intake UX, validated submission | programme/benefit truth |
| Tracker | `tracker/` | operator workflow, lead handling, analytics | authority decisions |
| Somali hub | `so/` | public explanation/navigation | canonical official truth |
| Pilke | `pilke/` | protected campaign pages | repo-wide shared refactors |

## Knowledge surfaces

| Home | Purpose |
|---|---|
| `knowledge/canonical/services/` | durable service explanations and ownership |
| `knowledge/canonical/programmes/` | time-bound opportunities and dates |
| `knowledge/canonical/benefits/` | benefit/rule explanations and conditions |
| `knowledge/canonical/rules/` | cross-service rules and authority procedures |
| `knowledge/canonical/cities/` | municipal differences |
| `knowledge/canonical/intake/` | reusable routing/interview guidance |
| `knowledge/link-bank/` | verified official links and calculators |
| `knowledge/language/` | Somali/Finnish terminology decisions |
| `research/` | dated verification work |
| `references/` | evidence artifacts and source material |
| `working/` | temporary noncanonical work |

## Dependency direction

`official source → research evidence → canonical knowledge → operator/public presentation`

Do not reverse this chain. A public page or old internal note must not become evidence for a canonical claim merely because it is already deployed.

## Runtime stability

Production route folders stay in place. Context and canonical knowledge are layered around them so agents can navigate without breaking URLs or coupling deployment layout to the knowledge model.
