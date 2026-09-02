# Tracked file catalogue — 2026-08-28

> This is the exhaustive index of the 240 files tracked on `master` at commit `9a51b8e`. It is a navigation catalogue, not a second source of truth: runtime behavior remains defined by the deployed code, Supabase functions/schema, and the nearest `CONTEXT.md`.
>
> Historical route note: this snapshot predates ADR 0004. Its `so/` entries describe commit `9a51b8e`; current canonical family guidance lives under `caawi/`, and `/so/*` now redirects permanently.

## Current system in one view

- **Public routes:** the organisation site, Somali guidance (`/so`), and the phone-first family intake (`/caawi`).
- **Private operations:** `/tracker` is the browser command centre; authenticated admin Edge Functions and Supabase hold all family-operational data.
- **Deployment:** Vercel production is linked to GitHub `master`; `vercel.json` preserves the public route contracts and disables caching for `/caawi` and `/tracker`.
- **Known capture gap:** nine Edge Functions are documented as live. This repository currently captures five admin functions only. `family-intake-contact`, `family-intake-submit`, `family-funnel-track`, and `nightly-retention` remain live-only sources and are absent from Git. Their documented contracts are in `docs/qa/current-state-audit-2026-08-28.md`; do not edit or redeploy them until their exact deployed source is captured and reviewed.

## Catalogue

### Repository routing, governance, and reusable rules

Files in this group share the role named above.

- `.claude/skills/family-research/SKILL.md`
- `.claude/skills/production-releasing/SKILL.md`
- `.claude/skills/repository-auditing/SKILL.md`
- `.claude/skills/seo-growth/SKILL.md`
- `.claude/skills/session-bootstrap/SKILL.md`
- `.gitattributes`
- `.gitignore`
- `AGENTS.md`
- `BRAND.md`
- `CLAUDE.md`
- `CONTEXT.md`
- `_core/CONVENTIONS.md`
- `_core/policies/freshness.md`
- `_core/policies/legal-and-authority-language.md`
- `_core/policies/localization.md`
- `_core/policies/pii-and-sensitive-data.md`
- `_core/policies/public-private-boundary.md`
- `_core/policies/source-quality.md`
- `_core/qa/route-safety-rules.md`
- `_core/qa/source-integrity-rules.md`
- `_core/qa/structure-rules.md`
- `_core/qa/terminology-rules.md`
- `_core/schemas/authority.schema.md`
- `_core/schemas/criteria.schema.md`
- `_core/schemas/evidence.schema.md`
- `_core/schemas/message.schema.md`
- `_core/schemas/programme.schema.md`
- `_core/schemas/research-result.schema.md`
- `_core/schemas/route.schema.md`
- `_core/schemas/service.schema.md`
- `_core/schemas/source.schema.md`
- `llms.txt`

### GitHub automation and deterministic QA

Files in this group share the role named above.

- `.github/workflows/final-trust-links.yml`
- `.github/workflows/legal-trust-pass.yml`
- `.github/workflows/site-qa.yml`
- `.github/workflows/somali-language-qa.yml`
- `.github/workflows/somali-language-rewrite-pass2.yml`
- `.github/workflows/somali-language-rewrite-pass3.yml`
- `.github/workflows/somali-language-rewrite.yml`
- `.github/workflows/verify-internal-routes.yml`
- `.github/workflows/verify-seo-links.yml`
- `scripts/check_internal_routes.py`
- `scripts/check_seo_metadata.py`
- `scripts/check_verified_links.py`
- `scripts/final_trust_links.py`
- `scripts/legal_trust_pass.py`
- `scripts/legal_trust_qa.py`
- `scripts/repo_integrity_qa.py`
- `scripts/site_qa.py`
- `scripts/somali_language_qa.py`
- `scripts/somali_language_rewrite.py`
- `scripts/somali_language_rewrite_pass2.py`
- `scripts/somali_language_rewrite_pass3.py`
- `scripts/usability_qa.py`
- `tests/caawi.test.js`
- `tests/call-outcomes.test.js`

### Public organisation site and shared assets

Files in this group share the role named above.

- `assets/aqoon-family-route-3d.webp`
- `assets/main.js`
- `assets/perustaja.jpg`
- `assets/perustaja.webp`
- `assets/public-usability.css`
- `assets/site.css`
- `assets/site.js`
- `assets/styles.css`
- `disclaimer/index.html`
- `havainnot/index.html`
- `havainnot/miksi-hyva-palvelu-ei-tavoita/index.html`
- `havainnot/miksi-kaannos-ei-riita/index.html`
- `havainnot/miksi-kampanja-myohastyy/index.html`
- `havainnot/miksi-linkki-ei-ole-ohjausta/index.html`
- `havainnot/miksi-tuttu-kanava-toimii/index.html`
- `havainnot/miten-palvelupolkua-mitataan/index.html`
- `index.html`
- `menetelma/index.html`
- `og.png`
- `og.svg`
- `paketit/index.html`
- `robots.txt`
- `sanasto/index.html`
- `sitemap.xml`
- `tapaus/index.html`
- `tietosuoja/index.html`

### Public Somali guidance

Files in this group share the role named above.

- `so/CLAUDE.md`
- `so/CONTEXT.md`
- `so/ajankohtaiset/index.html`
- `so/ammatillinen-koulutus/index.html`
- `so/asumistuki/index.html`
- `so/cv-tyohakemus/index.html`
- `so/dib-ugu-noqo-dugsi/index.html`
- `so/disclaimer/index.html`
- `so/esiopetus/index.html`
- `so/espoo-paivakoti/index.html`
- `so/finnish-course/index.html`
- `so/harrastus-ilmainen/index.html`
- `so/helsinki-paivakoti/index.html`
- `so/index.html`
- `so/kela-warqad/index.html`
- `so/kela/index.html`
- `so/kotihoidon-tuki/index.html`
- `so/koulu-tuki/index.html`
- `so/laskut-sopimukset/index.html`
- `so/liittyma/index.html`
- `so/linkit/index.html`
- `so/maxaan-codsan-karaa/index.html`
- `so/maxaan-xaq-u-leeyahay/index.html`
- `so/paivakoti-codsi/index.html`
- `so/paivakoti/index.html`
- `so/palveluseteli/index.html`
- `so/sababta-aqoon/index.html`
- `so/sahkosopimus/index.html`
- `so/shaqo/index.html`
- `so/tampere-paivakoti/index.html`
- `so/tietosuoja/index.html`
- `so/toimeentulotuki/index.html`
- `so/tyohakemus/index.html`
- `so/tyonhakijaksi/index.html`
- `so/tyoton-tyonhakija/index.html`
- `so/vakuutus/index.html`
- `so/vantaa-paivakoti/index.html`
- `so/waxbarasho/index.html`
- `so/yaan-nahay/index.html`
- `so/yki/index.html`

### Public family intake (/caawi)

Files in this group share the role named above.

- `caawi/CLAUDE.md`
- `caawi/CONTEXT.md`
- `caawi/app.css`
- `caawi/app.js`
- `caawi/index.html`
- `caawi/usability.css`
- `caawi/wording-fixes.js`

### Private tracker / operator command centre

Files in this group share the role named above.

- `tracker/CLAUDE.md`
- `tracker/CONTEXT.md`
- `tracker/analytics-actions.css`
- `tracker/analytics-mobile-v2.css`
- `tracker/analytics-mobile-v2.js`
- `tracker/app.css`
- `tracker/app.js`
- `tracker/call-outcomes.css`
- `tracker/call-outcomes.js`
- `tracker/crm-manage.css`
- `tracker/crm-manage.js`
- `tracker/crm-reactive.css`
- `tracker/crm-reactive.js`
- `tracker/human-labels.js`
- `tracker/incomplete-intake.js`
- `tracker/index.html`
- `tracker/interview-form-enhancements.js`
- `tracker/interview-match.js`
- `tracker/interview-smart-notes.js`
- `tracker/multineed-adapter.js`
- `tracker/operations-system.css`
- `tracker/operations-system.js`
- `tracker/operator-identity.js`
- `tracker/research-analytics.css`
- `tracker/scenario-learning.js`
- `tracker/universal-proof-questions.js`
- `tracker/usability.css`
- `tracker/visual-v3.js`
- `tracker/workspace-ux.css`

### Supabase source captured in Git

Files in this group share the role named above.

- `supabase/functions/family-incomplete-admin/index.ts`
- `supabase/functions/family-leads-admin/index.ts`
- `supabase/functions/family-leads-manage/index.ts`
- `supabase/functions/family-scenario-admin/index.ts`
- `supabase/functions/ops-admin/index.ts`
- `supabase/migrations/20260827_aqoon_operations_system.sql`
- `supabase/migrations/20260828_call_outcomes_and_funnel_events.sql`
- `supabase/migrations/20260828_operator_fk_indexes_and_dedupe.sql`
- `supabase/migrations/20260828_operators_auth_link.sql`
- `supabase/migrations/20260828_sales_activities_operator_attribution.sql`
- `supabase/migrations/20260828_two_operator_os_foundation.sql`

### Architecture, decisions, briefs, and audit records

Files in this group share the role named above.

- `docs/architecture/business-operating-model.md`
- `docs/architecture/icm-knowledge-governance.md`
- `docs/architecture/knowledge-density-and-link-bank.md`
- `docs/architecture/repo-map.md`
- `docs/briefs/aqoon-two-operator-os-v2-fast-start.md`
- `docs/decisions/0001-public-private-canonical-homes.md`
- `docs/decisions/0002-two-operator-os-interview-and-data-foundation.md`
- `docs/migration/legacy-knowledge-migration.md`
- `docs/qa/audit-1-structure-and-boundaries.md`
- `docs/qa/audit-2-source-and-fact-integrity.md`
- `docs/qa/audit-3-route-safety-and-language.md`
- `docs/qa/current-state-audit-2026-08-28.md`
- `docs/qa/full-repository-audit-2026-08-27.md`
- `docs/qa/full-repository-audit-2026-08-28.md`

### Research and operating workspaces

Files in this group share the role named above.

- `internal/first-call-questionnaires.md`
- `internal/open-programmes.md`
- `seo/CONTEXT.md`
- `seo/verified-links.json`
- `workspaces/evidence-and-research/CLAUDE.md`
- `workspaces/evidence-and-research/CONTEXT.md`
- `workspaces/evidence-and-research/references/CONTEXT.md`
- `workspaces/evidence-and-research/references/aqoon-funnel-evidence-2026-08-27.md`
- `workspaces/evidence-and-research/references/aqoon-funnel-evidence-2026-08-28.md`
- `workspaces/evidence-and-research/references/authorities/core-authorities.md`
- `workspaces/evidence-and-research/references/calculators/kela-calculators.md`
- `workspaces/evidence-and-research/references/current/2026-change-log.md`
- `workspaces/evidence-and-research/references/interview-instrument-design-2026-08-27.md`
- `workspaces/evidence-and-research/references/pilke-phase-1-follow-up-2026-08-28.md`
- `workspaces/evidence-and-research/references/routes/daycare-general.md`
- `workspaces/evidence-and-research/references/routes/employment-services-current.md`
- `workspaces/evidence-and-research/references/routes/immigration-current.md`
- `workspaces/evidence-and-research/references/routes/school-s2-2026.md`
- `workspaces/evidence-and-research/references/services/education-yki.md`
- `workspaces/evidence-and-research/references/services/kela-yleistuki.md`
- `workspaces/evidence-and-research/references/sources/official-link-bank.md`
- `workspaces/evidence-and-research/references/sources/source-records-2026.md`
- `workspaces/family-research/CLAUDE.md`
- `workspaces/family-research/CONTEXT.md`
- `workspaces/family-research/references/CONTEXT.md`
- `workspaces/family-research/references/interview-cheatsheets/README.md`
- `workspaces/family-research/references/interview-cheatsheets/children-and-school.md`
- `workspaces/family-research/references/interview-cheatsheets/daycare-and-early-childhood.md`
- `workspaces/family-research/references/interview-cheatsheets/education-and-training.md`
- `workspaces/family-research/references/interview-cheatsheets/entrepreneurship.md`
- `workspaces/family-research/references/interview-cheatsheets/integration.md`
- `workspaces/family-research/references/interview-cheatsheets/kela-and-income.md`
- `workspaces/family-research/references/interview-cheatsheets/programmes-and-coaching.md`
- `workspaces/family-research/references/interview-cheatsheets/quick-map.md`
- `workspaces/family-research/references/interview-cheatsheets/service-support-and-contracts.md`
- `workspaces/family-research/references/interview-cheatsheets/work-and-unemployment.md`
- `workspaces/family-research/stages/01-case-routing/CONTEXT.md`
- `workspaces/family-research/stages/02-source-plan/CONTEXT.md`
- `workspaces/family-research/stages/03-live-research/CONTEXT.md`
- `workspaces/family-research/stages/04-match-evaluation/CONTEXT.md`
- `workspaces/family-research/stages/05-case-brief/CONTEXT.md`
- `workspaces/family-research/stages/06-human-review/CONTEXT.md`
- `workspaces/messaging/CLAUDE.md`
- `workspaces/messaging/CONTEXT.md`
- `workspaces/product-qa/CLAUDE.md`
- `workspaces/product-qa/CONTEXT.md`

### Design references and protected campaign pages

Files in this group share the role named above.

- `design-ref/Etusivu.dc.html`
- `design-ref/Kaksi puolta -vaihtoehdot.dc.html`
- `design-ref/PROMPTS.md`
- `design-ref/README.md`
- `design-ref/menetelma.dc.html`
- `design-ref/paketit.dc.html`
- `design-ref/perustaja-source.png`
- `design-ref/tapaus.dc.html`
- `pilke/index.html`
- `pilke/so/index.html`

### Deployment configuration

Files in this group share the role named above.

- `vercel.json`


## How a new agent should start

1. Read `AGENTS.md`, `CLAUDE.md`, `CONTEXT.md`, then the relevant local context.
2. For a runtime change, inspect the entry HTML, every loaded or dynamically injected script, its Edge Function contract, relevant migration and test before editing.
3. Treat `docs/qa/current-state-audit-2026-08-28.md`, `docs/decisions/0002-two-operator-os-interview-and-data-foundation.md`, and `docs/qa/full-repository-audit-2026-08-28.md` as the ordered current-state handover.
4. Keep PII and credentials out of Git; never mistake this public catalogue for live family records.
