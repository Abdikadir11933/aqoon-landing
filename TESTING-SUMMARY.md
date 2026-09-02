# AQOON testing status router

This file intentionally does not claim that a historical test run proves the current production system. The August 2026 shared-password and six-phase test plan is superseded.

## Current test contract

- `/caawi` is the canonical family surface; `/so/*` is redirect-only compatibility.
- `/tracker` requires Supabase Auth linked to an active approved operator. There is no shared Tracker password.
- The current runtime inventory must be derived from `tracker/index.html` and checked with `node scripts/tracker_collection_qa.js`; fixed historical asset counts are not authoritative.
- Never use real-looking names or phone numbers as production test data.
- Anonymous reach, identifiable contacts, completed intake, interviews, actions, handoffs, outcomes and persistence are distinct measurements.

## Authoritative instructions

- Repository rules: `CLAUDE.md`, `CONTEXT.md`
- Family surface: `caawi/CONTEXT.md`
- Tracker: `tracker/CONTEXT.md`
- Product QA: `workspaces/product-qa/CONTEXT.md`
- End-to-end method: `.claude/skills/e2e-testing/SKILL.md`
- Current dated findings: `docs/qa/` and `workspaces/audits/`

## Minimum clean baseline

```bash
python scripts/repo_integrity_qa.py
python scripts/site_qa.py
python scripts/check_seo_metadata.py
python scripts/usability_qa.py
python scripts/legal_trust_qa.py
python scripts/check_internal_routes.py
python scripts/somali_language_qa.py
node --test tests/*.test.js
node scripts/tracker_collection_qa.js
```

Passing these checks is necessary but not sufficient for a release. Authenticated tracker behaviour and live data reconciliation require an authorised operator session and must be recorded with environment, commit and timestamp.

Historical reports and screenshots are retained as dated evidence. Their passwords, test identities, phase counts, file counts and readiness claims must not be reused as current instructions.
