# Programme Record Schema

```yaml
---
id: programme.<provider>.<slug>
record_type: programme
provider_id:
name:
scope:
status: discovery_only | open | closed | unknown
volatility: live
last_verified_at:
source_ids: []
criteria_ids: []
deadline:
capacity_status:
---
```

A programme may be marked `open` only after a current provider-primary check.
