# Freshness Policy

Every mutable knowledge record must declare `volatility`, `last_verified_at` and a recheck rule.

- `low`: stable role/methodology. Recheck on scheduled audit or source change.
- `medium`: service process/city route. Recheck at least every 90 days or before high-impact publication.
- `high`: benefit rules/amounts, immigration, employment subsidies, education requirements, municipal fees. Recheck from the competent official source for every case where the fact affects advice.
- `live`: jobs, programme openings, deadlines, capacity, available places, booking slots. Verify immediately before recommendation.

Repository age never converts a high/live claim into current truth. If a source is stale, unavailable or contradictory, return `possible-must-confirm` or `verification_pending`.
