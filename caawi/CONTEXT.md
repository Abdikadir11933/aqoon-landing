# /caawi Context

Purpose: fast parent/family intake that captures contact details and enough structured need information for follow-up.

Canonical dependencies:
- safety/governance: `../_core/`
- Somali localization: `../_core/policies/localization.md`
- downstream family research: `../workspaces/family-research/CONTEXT.md`
- acquisition and CTA contract: `../workspaces/messaging/references/aqoon-demand-generation-and-content-os.md`

Rules:
- phone/name remain first so a partial intake can still be followed up.
- do not expose Supabase secrets or admin reads in the browser.
- do not add eligibility promises to intake copy.
- UI work must preserve mobile speed and submit reliability.
- PII is runtime/private data, never reference material.
- the free intake is the family's trusted entry door; it must give useful help even when no commercial partner match exists.
- consent to contact about the stated problem is separate from consent to share information with a partner, receive unrelated offers or join continuing marketing.
- when AQOON may be paid by a recommended provider, disclose that relationship before the family acts on the recommendation.
- intake may capture several confirmed needs, but must not become a long universal questionnaire. Progressive questions belong in the operator interview.
- campaign links and alternate domains must preserve a working mobile handoff and attributable source/campaign values without putting PII into anonymous analytics.
