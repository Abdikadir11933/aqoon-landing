# SEO and discoverability context

Purpose: make AQOON easy to discover for real user problems while preserving trust, factual accuracy and conversion quality.

## Ownership

- Public HTML pages own presentation and page-level metadata.
- `sitemap.xml` owns the crawlable canonical route list.
- `robots.txt` owns crawler exclusions; `/tracker` is private and excluded.
- `seo/verified-links.json` is a curated discovery/QA manifest for links used in search/content work. It is not the canonical owner of detailed public-service facts.
- Exact factual claims belong to the relevant verified knowledge/evidence record and the current official source.

## Search-content model

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

Internal links should answer the reader's natural next question. Family-facing topic pages should lead naturally toward `/caawi` when hands-on help is appropriate.

## Safety and language

AQOON is independent. Do not imply authority status, guaranteed eligibility or guaranteed outcomes. Volatile rules, deadlines, fees, programme openings and benefit details require current-source verification. Natural Somali/Finnish is more important than forcing exact keyword repetitions.

## QA

Run `python scripts/check_seo_metadata.py`, `python scripts/site_qa.py`, internal-route checks and curated-link checks before substantial SEO releases.
