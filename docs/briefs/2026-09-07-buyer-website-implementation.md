# Buyer website implementation, 7 September 2026

## Task and authorization

Implement the approved website audit sequentially. Audience: organisation buyers unfamiliar with AQOON. The user approved execution after receiving the audit. Base master: `8c1949270f0a8de00ff0c2906b4bff5594e65019`. Preserve the current brand, public route contracts, independent family help and dated evidence limitations.

## Scope and impact

Static B2B HTML → shared `assets/site.css` and navigation-only `assets/site.js` → existing external booking link or email. No database, API, collection or data-contract changes. Tracker and protected Pilke page source remain outside scope. Only protected sitemap entries are removed. The family guidance hub receives one duplicate-link correction and one visible label correction; intake logic is untouched.

Loaded contracts: root routing and context, AI coding stage contracts, product QA, messaging, brand, business operating model, evidence index and dated pilot/analytics references, SEO and Caawi boundaries. The website-review and production-releasing procedures guide the handoff. Historical analytics retain the 1 September 2025–31 August 2026 filter and 2 September source date. Filter length is not operating history. Pilot proof remains bounded; no private records, correspondence or financial details are published.

## Implemented sequence

1. Correct analytics labels and distinguish possible future work from a purchased Pilke continuation. Add draft/generated-fragment noindex policy, remove protected sitemap entries, update changed B2B lastmod dates, add keyboard skip links and improve cream text contrast and narrow layouts.
2. Install the approved Finnish homepage: explicit Somali-speaking audience and first purchase; problem; research/pilot then separately agreed delivery; practical method; limited pilot proof; founder/team/trust; clear 30-minute meeting agenda and email alternative. Preserve the bridge illustration and small founder photo. Move article exploration to navigation and secondary pages.
3. Clarify the services report, buyer inputs, responsibilities and independent continuation decision. Reorder the public case study so the bounded result and learning precede methodology and distribution analytics. Add the same concrete contact route to About. Standardise B2B booking labels.

## Acceptance and verification

- A buyer can find the initial report, their own responsibilities and the separate continuation decision without opening disclosures.
- Homepage names the current audience and offer without claiming proven results for all immigrant groups.
- Reach, applications and verified starts remain separate; no invented rate, price, duration or capacity.
- Skip links precede navigation; target main content; visible focus remains available. Mobile offer phases stack at 480px. Longer booking labels use mobile navigation through 1100px, with matching JavaScript breakpoint.
- Drafts are noindex both in HTML and Vercel headers; the generated fact fragment gets a header without changing its source or consumers. These are intentional public previews, not access-controlled files.
- Run source SEO, routes, usability, legal/trust, context and integrity gates, JavaScript syntax and the existing regression suite. Verify exact deployment SHA and public buyer routes before claiming a production release.

Local checks before preview: SEO (58 sitemap pages), site QA (58 routes, 39 family pages), internal links (754 links, 68 HTML files, 18 redirects), legal/trust, context and repository integrity passed. All 215 existing Node regression tests passed. Usability QA passed with an existing warning on an input in `pkv-treeni/index.html`, outside this change. No Lighthouse or full accessibility-compliance claim is made.

## Measurement implementation contract and remaining dependencies

Existing shared B2B JavaScript handles navigation only. No verified buyer conversion collector or booking-completion integration is configured in this change. Do not report clicks as enquiries or booked meetings. The family funnel is separate.

When a destination and data-handling policy are selected, use this small event contract:

| Event | Allowed fields | Meaning |
|---|---|---|
| `buyer_booking_click` | canonical page path, placement (`header`, `mobile_menu`, `hero`, `closing`, `footer`), page version | Visitor chose the calendar; not a booking |
| `buyer_email_click` | canonical page path, placement, page version | Visitor opened an email route; not a sent message |
| `buyer_booking_confirmed` | internal booking ID and date in the private system | Confirmed booking; derive from provider confirmation, not outbound click |

No names, emails, phone numbers, full URLs/query strings, form text or family data in anonymous events. Exclude QA traffic. Confirm retention and consent requirements before activating collection. Use a private enquiry register for source, buyer type, stated service/problem, fit, meeting held and agreed next step; never store populated records in GitHub.

Start with five relevant buyers, with no AQOON introduction. Show the homepage briefly, then ask: what does AQOON do; who is it for; what would you buy first; what is proven; what would you do next? Record unaided answers and misunderstandings privately. Then ask them to locate the deliverable and next action. Suggested acceptance threshold: at least four of five identify the audience, first purchase and next action; nobody mistakes views for verified starts. This is a directional usability gate, not statistical proof.

Track qualified enquiries and held meetings by comparable observation period and traffic source. An enquiry is qualified when an organisation has a relevant service, target audience, concrete access barrier and a plausible route to a scoped engagement. Report small counts alongside rates and denominators. A higher click rate without clearer understanding or better-fit enquiries is not success. Do not A/B test low traffic prematurely.

Prepared external calendar copy:

**Title:** Keskustelu palvelunne tavoittamisesta · AQOON

**Description:** Käydään 30 minuutissa läpi palvelunne, kohderyhmänne ja se, missä eteneminen pysähtyy. Arvioidaan, voisiko rajattu kartoitus ja pilotti auttaa. AQOONin tämänhetkinen vahvin osaamisalue on somalinkielisten perheiden ja aikuisten tavoittaminen sekä käytännön hakemisen tuki. Voit myös kirjoittaa osoitteeseen abducadir_abdullahi@aqoon.live.

Calendar settings remain external: align event description, Finnish presentation where supported and clear time-zone display. No real message or booking was submitted. Buyer recruitment, comprehension sessions and later copy experiments require real participants; no results are fabricated.

## Recovery and release status

Rollback by reverting this focused source change; no migration or runtime-data rollback is needed. Local preview at loopback was blocked by the browser. Preview/production browser evidence and exact release status will be recorded in the final handoff rather than inferred from local tests.
