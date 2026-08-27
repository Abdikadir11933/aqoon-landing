# /caawi Context

Purpose: fast parent/family intake that captures contact details and enough structured need information for follow-up.

Canonical dependencies:
- safety/governance: `../_core/`
- Somali localization: `../_core/policies/localization.md`
- downstream family research: `../workspaces/family-research/CONTEXT.md`

Rules:
- phone/name remain first so a partial intake can still be followed up.
- do not expose Supabase secrets or admin reads in the browser.
- do not add eligibility promises to intake copy.
- UI work must preserve mobile speed and submit reliability.
- PII is runtime/private data, never reference material.
