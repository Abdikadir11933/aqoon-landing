# Programme / opportunity record contract

Use for time-bound courses, groups, projects, training, events and other opportunities.

```yaml
id: stable-id
name: official programme name
provider: organisation
category: work | education | language | children | hobby | integration | entrepreneurship | other
cities: []
audience: factual description from source
status: verified | needs_recheck | closed | retired
application_opens: YYYY-MM-DD | unknown
application_closes: YYYY-MM-DD | rolling | unknown
starts: YYYY-MM-DD | period | unknown
ends: YYYY-MM-DD | period | unknown
cost: source-stated amount/free/unknown
language_support: source-stated information only
childcare: source-stated information only
how_to_apply: source-stated next step
official_sources:
  - source-record-id
checked_at: YYYY-MM-DD
recheck_after: YYYY-MM-DD
```

Optional:

```yaml
capacity: source-stated only
selection: source-stated only
operator_match_clues: []
public_summary_so: plain Somali summary
public_page_routes: []
```

Rules:

- Never infer acceptance from match clues.
- Never keep an old deadline as current without rechecking the provider.
- If a programme closes, mark it closed/retired instead of deleting history needed for provenance.
