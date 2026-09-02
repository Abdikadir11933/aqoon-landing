# ADR 0004: Caawi is the canonical family-facing home

Status: accepted, 2 September 2026.

## Decision

- `https://aqoon.live/` and the established Finnish route folders are the public B2B surface for selected buyers, organisations and partners.
- `https://aqoon.live/caawi` is the canonical Somali-first family surface and the primary intake.
- Somali guidance, help and search content lives below `/caawi/<topic>`; the guidance hub is `/caawi/xog`.
- `/tracker` is the private operational core behind intake, interviews, follow-up, action and outcome measurement.
- Historical `/so` URLs permanently redirect to their corresponding `/caawi` URLs. They are not canonical or included in the sitemap.

## Runtime boundary

`family/community reach -> /caawi or /caawi/<topic> -> consented intake -> Supabase -> private /tracker -> interview -> verified route/action -> outcome`

The B2B site may describe aggregate, PII-free evidence from this engine, but it is not the family help destination. Family content, search pages and community links must not use the B2B root as their default CTA.

There are two SEO lanes. B2B SEO on `aqoon.live` answers organisation searches about Somali integration, trusted reach, multilingual navigation, conversion, onboarding, retention and missed demand. Caawi SEO under `/caawi/<topic>` answers Somali-speaking people's practical help searches. Each lane keeps its own audience promise and conversion action.

## Attribution contract

The current intake runtime stores `referrer_host`, `utm_source`, `utm_medium` and `utm_campaign`. A visit from a Caawi guidance page to the intake receives `utm_source=caawi_seo` when no explicit campaign source is present. Do not put names, phone numbers or other PII in UTM values.

Asset, connector and campaign details may be mapped through a governed `utm_campaign` identifier outside anonymous analytics. Do not describe `source_actor`, `source_asset` or `campaign_id` as live first-class fields until the runtime schema implements them.

## Migration safety

Old `/so` paths remain reachable through permanent redirects. Canonicals, internal links, the sitemap, `llms.txt`, QA and route documentation use `/caawi`. `/caawi` keeps its intake reliability and privacy rules; moving guidance content does not widen access to Tracker or Supabase data.
