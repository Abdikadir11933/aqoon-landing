---
name: repository-auditing
description: Audit and harden the AQOON repository end to end. Use for full audits, architecture cleanup, code-quality sweeps, security/privacy reviews, SEO checks, CI improvements, or requests to find and fix repository-wide mistakes without changing working UI unnecessarily.
---

# Repository auditing

Audit in this order so fixes address root causes rather than symptoms.

## 1. Inventory and ownership

- Read `docs/architecture/repo-map.md` and compare it with the actual Git tree.
- Identify runtime code, governance/context, research/evidence, generated/reference material, tests and CI.
- Flag duplicate sources of truth, stale maps, orphan files and misleading folder names.
- Preserve established production routes.

## 2. Context architecture

- Root `CLAUDE.md` must stay a concise router, not a knowledge dump.
- Root `CONTEXT.md` owns stable repository truth.
- Local contexts own local contracts.
- Skills own repeatable procedures.
- Mutable implementation detail belongs close to code or in machine-verifiable contracts, not copied across handbooks.

## 3. Security and privacy

- Check tracked files for local secrets/environment files and browser credential exposure.
- Confirm family PII stays out of public GitHub and anonymous analytics.
- Confirm private tracker routes remain noindex, disallowed and uncached.
- For Supabase work, verify RLS and server-side auth boundaries.

## 4. Runtime and data contracts

- Inspect current HTML/JS/CSS and Supabase functions/schema before proposing architecture changes.
- Check script load order, error degradation, API action names and schema assumptions.
- Do not replace working flows simply to make them “cleaner”.

## 5. SEO and public content

- Run metadata, sitemap, internal-route and verified-link checks.
- Check one canonical URL and one clear H1 per indexed page.
- Protect useful human content from keyword stuffing or thin programmatic duplication.
- Verify volatile public-service claims against live official sources.

## 6. Accessibility and mobile UX

- Run existing usability guards.
- Preserve focus, touch targets, readable no-JS behavior where required, form completion and existing interaction patterns.
- Treat UI regression as a bug even if the backend change works.

## 7. CI and deterministic checks

Prefer scripts and CI over prose reminders. Ensure new production JS is syntax-checked and new critical files are included in repository-integrity tests.

Minimum audit commands:

- `python scripts/repo_integrity_qa.py`
- `python scripts/site_qa.py`
- `python scripts/check_seo_metadata.py`
- `python scripts/usability_qa.py`
- `python scripts/legal_trust_qa.py`
- `node --test tests/caawi.test.js`

## 8. Release verification

Inspect the final diff, then verify CI and the exact deployed commit. If Vercel is rate-limited or not READY, say the code is committed but not live.

Fix high-confidence bugs found during the audit. Document unresolved external blockers separately from code defects.
