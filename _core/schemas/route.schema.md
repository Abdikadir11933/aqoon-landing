# Route Record Schema

A route connects a user need to the correct current authority/provider path.

```yaml
---
id: route.<domain>.<scope>
record_type: route
need:
scope:
authority_ids: []
required_inputs: []
blocking_inputs: []
source_ids: []
volatility:
last_verified_at:
steps: []
decision_maker:
---
```

Required chain: NEED -> MATCHING CRITERIA -> CORRECT AUTHORITY/PROVIDER -> CURRENT SOURCE -> CURRENT RULE -> MATCH STATUS -> NEXT ACTION -> WHO DECIDES.
