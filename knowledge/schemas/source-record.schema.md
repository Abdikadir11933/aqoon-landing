# Source record contract

Use this contract for every official source that supports AQOON knowledge.

Required fields:

```yaml
id: stable-kebab-case-id
title: human-readable source title
owner: authority or organisation
source_type: official-page | official-pdf | calculator | form | service-directory | legislation | programme-page
url: https://...
language: fi | sv | en | so | multilingual
jurisdiction: Finland | city/region
scope: what this source actually covers
checked_at: YYYY-MM-DD
status: verified | needs_recheck | retired
recheck_after: YYYY-MM-DD | event-triggered | none
```

Optional but strongly recommended:

```yaml
last_updated_at_source: date shown by publisher, if any
access_notes: login, cookie, JavaScript or accessibility constraints
important_sections:
  - section/heading
claims_supported:
  - claim-id
supersedes: older source id
notes: ambiguity, caveats, historical context
```

Rules:

1. Prefer the authority that owns the service/rule over secondary explainers.
2. Search-engine snippets are discovery only, never final evidence.
3. A URL alone is not a verified record. Record what it supports and when it was checked.
4. If an authority page conflicts with an older AQOON page, mark the AQOON claim for correction.
5. If the official source is unclear, record the uncertainty instead of inferring a legal/eligibility conclusion.
