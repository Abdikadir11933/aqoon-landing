# Service record contract

Use for durable public/authority services such as Kela, municipal daycare, employment services, school support routes or education services.

```yaml
id: stable-id
name_fi: official Finnish name
name_so: plain Somali label or null
owner: responsible authority/organisation
jurisdiction: Finland | municipality | wellbeing-services-county | other
cities: []
category: work | education | children | benefits | integration | immigration | housing | health | other
status: verified | needs_recheck | retired
summary_so: short plain-language explanation
who_it_is_for: factual audience description, not an AQOON eligibility decision
what_to_check:
  - fact the user/operator must verify
how_to_start:
  - concrete next step
official_sources:
  - source-record-id
checked_at: YYYY-MM-DD
recheck_after: YYYY-MM-DD | event-triggered | none
```

Optional:

```yaml
forms: []
calculators: []
contact_routes: []
related_services: []
city_variants: []
operator_notes: []
public_page_routes: []
```

Do not write `eligible: true/false` for a person. Record official conditions and the facts that must be checked instead.
