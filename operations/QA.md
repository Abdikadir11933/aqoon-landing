# AQOON release QA contract

Every substantial knowledge/site release runs two different QA passes. A large Finland-wide knowledge release runs three content audits before the final deploy.

## Pass A — knowledge/content QA

Check every changed claim for:

- current official source
- correct jurisdiction/city
- correct audience and conditions
- dates/deadlines/fees/current service name
- no invented eligibility or guaranteed outcome
- no contradiction with another canonical record
- plain-language explanation that does not distort the official meaning
- official link works and points to the intended source
- calculator/tool limitations recorded
- checked date and recheck policy present where needed

For large knowledge rebuilds, repeat this pass three times with different lenses:

1. factual/source audit
2. completeness/contradiction audit
3. user-journey/language/navigation audit

## Pass B — implementation QA

Check:

- HTML/JS syntax and existing CI
- internal routes and redirects
- mobile 360/390 layouts for public flows
- `/caawi` contact-first flow and final submission
- `/tracker` authentication/privacy/noindex
- no PII or secrets in repo
- no Pilke campaign page changes unless explicitly requested
- cache headers, especially `/caawi` and `/tracker`
- production deployment corresponds to the exact intended Git commit

## Deploy verification

A commit is not live merely because it exists on `master`.

After merge/push:

1. identify the exact Git commit
2. inspect the Vercel production deployment
3. require READY/SUCCESS for that commit
4. fetch key live URLs and verify expected markers
5. if Vercel is rate-limited or stale, report source/CI and live production as separate states
