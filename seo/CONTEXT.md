# B2B SEO and shared discoverability context

Purpose: make AQOON easy for selected buyers, organisations and partners to discover while preserving trust, factual accuracy and conversion quality. This folder owns B2B SEO planning and shared technical SEO QA; `caawi/CONTEXT.md` owns family-topic selection, Somali guidance and the family conversion route.

Surface boundary:
- family questions, Somali help and service-navigation SEO belong under `https://aqoon.live/caawi/...`;
- the `/caawi` root is the family intake and `/caawi/xog` is the guidance hub;
- buyer-intent SEO belongs to the B2B root and established Finnish B2B routes. It may target searches about Somali integration, trusted community reach, multilingual service navigation, conversion, onboarding, retention and missed demand when AQOON has a truthful buyer proposition;
- `/so/*` is redirect-only and must not appear in canonicals, new internal links or the sitemap.

SEO and owned guidance pages are channels inside `../workspaces/messaging/references/aqoon-demand-generation-and-content-os.md`; they do not use a separate lead or funnel definition.

## Ownership

- Public HTML pages own presentation and page-level metadata.
- `sitemap.xml` owns the crawlable canonical route list.
- `robots.txt` owns crawler exclusions; `/tracker` is private and excluded.
- `seo/verified-links.json` is a curated discovery/QA manifest for links used in search/content work. It is not the canonical owner of detailed public-service facts.
- Exact factual claims belong to the relevant verified knowledge/evidence record and the current official source.

## Search-content model

### B2B lane

Start with the organisation's problem, not a generic description of Somalis or immigration. Connect the query to one AQOON capability and one buyer next step:

`buyer problem/search intent -> evidence or method -> scoped AQOON capability -> relevant B2B page -> qualified conversation`

Do not describe a community as an audience list for sale. Use only aggregate, PII-free evidence and distinguish proven results from hypotheses.

### Caawi family lane

Start from a real problem or query. A page earns its URL by providing distinct useful value: a clear answer, verified route, local difference, practical next step, or decision aid. Do not create shallow keyword variants or city clones.

For public-service topics, the pattern is:

user pain/search intent → current official source → plain-language explanation → next action → relevant AQOON help → measurement.

## Page contract

Indexed pages should have:

- correct language declaration
- unique useful title
- useful meta description
- one clear H1
- self-referencing canonical
- crawlable internal links
- sitemap inclusion
- no accidental noindex
- share metadata where useful
- structured data only when truthful and supported by visible content

## Growth discipline

Optimize for qualified actions, not traffic in isolation. Review source/query intent against starts, contact saves, completed requests, calls or other defined outcomes. Improve the page that produces the wrong behavior before creating more pages.

Internal links should answer the reader's natural next question. Family-facing topic pages under `/caawi/<topic>` should lead naturally toward the `/caawi` intake when hands-on help is appropriate. Do not route families to the B2B root as the default next step.

## Safety and language

AQOON is independent. Do not imply authority status, guaranteed eligibility or guaranteed outcomes. Volatile rules, deadlines, fees, programme openings and benefit details require current-source verification. Natural Somali/Finnish is more important than forcing exact keyword repetitions.

## QA

Run `python scripts/check_seo_metadata.py`, `python scripts/site_qa.py`, internal-route checks and curated-link checks before substantial SEO releases.
