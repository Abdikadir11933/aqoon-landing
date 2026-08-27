# Service Record Schema

```yaml
---
id: service.<authority>.<slug>
record_type: service
name_fi:
name_so:
authority_id:
decision_maker:
scope: national | regional | municipal | provider
routes: []
status: current | superseded | discovery_only
valid_from:
valid_until:
verification_state: verified | verification_pending | superseded | retired
last_verified_at:
volatility: low | medium | high | live
recheck_policy:
source_ids: []
matching_fields: []
authority_confirmation_required: []
aqoon_role: [explain, navigate, help-prepare]
aqoon_must_not: [decide-eligibility, guarantee-outcome]
supersedes: []
---
```
