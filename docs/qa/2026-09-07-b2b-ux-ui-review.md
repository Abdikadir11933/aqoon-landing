# AQOON public B2B UX/UI review, 2026-09-07

Status: implementation and local review complete; preview and production identifiers are added in the final verification section after deployment.

Scope: the public organisation-buyer website at `https://aqoon.live`, with the family-facing `/caawi` surface checked only as a boundary. Authenticated `/tracker` and protected `/pilke` functionality were not audited or changed.

## Executive verdict

The website now explains AQOON well enough to earn a relevant organisation buyer's next click. On the first screen, a buyer can identify the initial audience, the service-path problem, the starting offer and a concrete 30-minute next step. The supporting pages explain responsibilities and evidence with unusual honesty for an early-stage service.

It is not yet procurement-complete. The principal commercial gaps are outside visual polish: the booking page contains stale and overstated wording, no safe budget or delivery-time range is public, the proof base is one bounded pilot with at least one verified start, and the site has no B2B measurement. The correct description is a credible early-stage specialist service, not a proven scaled acquisition channel.

### Five highest-impact improvements

1. **Correct the Cal.com booking description.** It currently says AQOON can help organisations “tavoittamaan ja kotouttamaan maahanmuuttajaperheitä”. “Kotouttamaan” overstates AQOON's role, and the broad audience claim is less precise than the website. This requires access to the Cal.com event settings and remains an owner action.
2. **Give buyers safe commercial boundaries when they are genuinely established.** The services page explains the work and pricing drivers but not a budget range, typical calendar duration or monthly capacity. Do not invent these. Add them once delivery economics and availability are agreed.
3. **Build a permissioned evidence ladder beyond the first case.** Keep views, contacts, applications and verified starts separate. Add two or three comparable cases or attributed buyer statements only when permission and denominators exist.
4. **Measure buyer comprehension and qualified intent.** The B2B pages currently have no analytics. Add a consent-aware, data-minimised event plan only after choosing a lawful tool and updating privacy information.
5. **Test the proposition with actual buyers.** Ask representative municipal, provider and project buyers to explain what AQOON does, what they can buy and what happens next after a short exposure. This is the highest-value experiment because the current copy is a reasoned hypothesis, not validated comprehension data.

## What AQOON is, in plain language

| Question | Answer supported by current material |
|---|---|
| What does AQOON do? | AQOON finds where a useful service journey breaks for Somali-speaking families or adults, tests a more understandable route, and can then help people move from relevant information to an application, registration or verified start. |
| Who benefits? | Initially, Somali-speaking families and adults who need clearer information and practical help. The organisation benefits by learning why an intended audience is not entering or progressing through its service. |
| Who pays? | The municipality, city, daycare company, educational institution, project, association or other service provider commissions the work. Help for the family is free. |
| Which buyer problem is solved? | A service may exist and be useful, but the intended people may not discover it, understand whether it fits, trust the route or complete the practical steps. Low participation can therefore coexist with real need. |
| What does the buyer receive? | Phase 1 produces a bounded diagnosis and pilot, followed by a report on observed barriers and recommended next actions. A separately agreed Phase 2 can cover ongoing reach, personal guidance and follow-through. Materials and training are optional separate work. |
| What is distinctive? | AQOON combines community familiarity, human-checked Finnish service information, relevant channels, voluntary human contact, practical application help, explicit handoff responsibility and outcome-stage measurement. Language alone is not presented as the method. |
| What is demonstrated? | The documented Pilke work made service-path barriers visible and took at least one route from contact to a verified start. Separate content tests show distribution and sharing. Recorded requests cover several needs and cities. |
| What remains a hypothesis? | Stable conversion, causal incrementality, repeatability across services or language groups, acquisition cost, retention, scalable capacity and recurring commercial demand are not established. |

The complete journey is: relevant reach → understandable explanation → trust → voluntary contact → practical guidance → application or registration → actual start → agreed follow-through. A view is not a contact, a contact is not an application, and an application is not a start.

## Source of truth and architecture

- Repository: `Abdikadir11933/aqoon-landing`.
- Baseline branch and commit inspected: `master` at `77cf0883bf929fa5ae38f507562c8d6b69160656`.
- Production URL: `https://aqoon.live`.
- Observation date: 2026-09-07 UTC.
- Baseline production check: the Vercel deployment for `aqoon.live` was READY and identified the same commit as remote `master` before this implementation began.
- Architecture: static HTML pages with a shared CSS file and a small shared JavaScript file, deployed by Vercel. This is not a Next.js site. No framework migration is justified by the findings.

The source hierarchy followed `AGENTS.md`, `CLAUDE.md`, root `CONTEXT.md`, the complete website-review skill, `BRAND.md`, Product QA and SEO contexts, `docs/architecture/business-operating-model.md`, and `workspaces/evidence-and-research/references/aqoon-evidence-index.md`.

## Evidence used and limits

| Source | Source date | What it supports | Limitation preserved |
|---|---:|---|---|
| `aqoon-evidence-index.md` | Updated 2026-09-07 | Routing to current AQOON evidence | It selects evidence; it does not merge cohorts or validate founder reports. |
| `aqoon-founder-clarifications-2026-09-07.md` | 2026-09-07 | Business intent, journey model, faceless content and workflow-status caveat | Founder-reported context, not an independent impact study. |
| `aqoon-demand-evidence-2026-09-07.md` | Snapshot 2026-09-07 | 26 recorded needs across 22 people and 21 households, multiple topics and cities | Point-in-time operational aggregate. Requests are not applications or starts. No market-size or conversion inference. |
| `tiktok-analytics-2026-09-07.md` | Reviewed 2026-09-07, UI through 2026-09-06 | Account-window distribution and selected video behaviour | Account windows and selected videos, not individual outcome cohorts. No complete audiovisual review or spend reconciliation. |
| Documented pilot content test | 2026-04-30 to 2026-08-12 | 55 500 views and 372 shares, with the public page explicitly labelling them distribution measures | Not contacts, applications or starts. It is separate from the 365-day account analysis. |
| `pilke-phase-1-follow-up-2026-08-28.md` | 2026-08-28 | Provider feedback and at least one end-to-end verified start | Bounded pilot and anonymised AQOON memo. No stable conversion and no confirmed continuation purchase. |
| `business-operating-model.md` | Current at review | Approved buyer offer and privacy boundary | Buyers do not receive a raw family contact list. |

Supabase follow-up dates and workflow statuses were treated as potentially unmaintained. No missed-work or operational-failure claim was inferred from them. No private correspondence, financial data, credentials or family records are included here.

## What works and should be retained

- The hero leads with a human outcome, names the initial Somali-speaking audience and names organisation types before introducing method detail.
- The subheading explains the failure mode, the work and the Phase 1 starting point without relying on “demand-to-outcome”.
- The bridge diagram makes the service-to-need gap easier to understand without adding stock imagery.
- The homepage is concise: problem, offer, three-step method, bounded evidence, founder and one closing CTA.
- Services correctly separates a diagnostic pilot from separately agreed ongoing delivery. Materials and training are not misrepresented as equal packages.
- The method page identifies responsibilities, consent and separate outcome stages.
- The case page is unusually careful about evidence limits. It does not turn views into applications or imply a continuation sale.
- The founder is a named, credible public contact. The rest of the team is described collectively rather than padded with invented roles.
- The B2B and `/caawi` journeys are visually, linguistically and navigationally distinct.
- Semantic basics are sound across the 19 B2B routes inspected: one H1, logical heading order, main/navigation/footer landmarks, canonical URLs, useful metadata and readable HTML.

## Prioritised audit

Classification distinguishes observed defects from heuristic judgments and experiments.

| Page or component | Observed evidence | Buyer consequence | Recommended change | Classification | Priority / effort | Status |
|---|---|---|---|---|---|---|
| External Cal.com booking page | Rendered event description says AQOON helps “tavoittamaan ja kotouttamaan maahanmuuttajaperheitä”. Fields were accessible, but the UI mixed Finnish and English. | The final conversion step makes a broader, more official-sounding promise than the website and may reduce public-sector trust. | Replace the description with the same bounded service-path wording as the site. Configure a single language if Cal.com permits it. | Content/conversion weakness | P0 / low | Owner action, not changed because event-settings access was unavailable. |
| Shared text links and focus | Measured `#087D78` links on cream at about 4.46:1, `#087D78` on fog at about 4.10:1, and `#079D97` text/focus on cream at about 2.99:1. WCAG ratios are not rounded up. | Some text and the keyboard focus indicator fail minimum contrast. | Use `#066C68` for functional links and focus on light backgrounds; keep brighter teal as a decorative accent. Force white inline links in dark CTA panels. | Accessibility issue, verified defect | P0 / low | Implemented. |
| Unknown URLs | A rendered invalid URL showed Vercel's generic `404: NOT_FOUND`, a technical ID and only a Vercel documentation link. | A mistyped or stale link becomes a dead end and leaks hosting implementation instead of rebuilding trust. | Add a branded, noindex 404 with home, services, email and family-route choices. | Verified defect | P0 / low | Implemented. |
| Method closing CTA | Closing heading was “Vaihdetaan kokemuksia” with a vague paragraph and no email alternative. | The page changes from diagnosing a buyer problem to an unfocused networking invitation. | Use the same “Missä teidän palvelunne polku katkeaa?” question, 30-minute agenda and email alternative as the homepage. | Strong usability problem | P1 / low | Implemented. |
| Case footer | The email alternative was appended both to the main case CTA and the global footer booking link. | Repeated copy weakens hierarchy and makes the footer look accidental. | Keep the alternative in the page CTA; keep the global footer compact. | Verified defect | P1 / low | Implemented. |
| Navigation and booking hover | Keyboard focus existed, but pointer hover feedback on inline-styled navigation and booking links was weak or inconsistent. | Desktop buyers receive less confirmation that controls are interactive. | Add a darker underline state for navigation and a restrained focus-ring-like shadow for booking CTAs, with no movement. | Optional visual refinement | P2 / low | Implemented. |
| Brand implementation contract | `BRAND.md` said the menu breakpoint was 900 px and focus used bright teal, while the actual B2B override switched at 1100 px and accessible focus needed darker teal. | Future edits could reintroduce collisions or contrast failures. | Document 1100 px and distinguish decorative teal from functional-link teal. | Verified documentation defect | P1 / low | Implemented. |
| Services commercial detail | No public starting range, typical Phase 1 duration or capacity is given. The page only explains pricing drivers and that a quote is agreed first. | A qualified buyer cannot self-assess budget or timing before booking. | Publish honest ranges once economics and capacity are stable. Until then, explicitly keep the current “scope first, quote before work” wording. | Content/conversion weakness | P1 / medium | Unresolved business input. |
| Evidence depth | The strongest outcome is at least one verified start in one bounded pilot. Distribution figures are separated correctly. | Buyers can trust the honesty but cannot yet infer repeatability. | Add permissioned cases with identical funnel definitions, dates, denominator and limitations. | Content/conversion weakness | P1 / high over time | Evidence-building action. |
| Team assurance | Founder is named with relevant lived and delivery experience; other delivery expertise is collective and assignment-specific. | Procurement buyers may still ask who delivers, availability, safeguarding and continuity. | Add named delivery roles only when permission and stable availability exist. Answer governance questions in proposals meanwhile. | Trust heuristic | P2 / medium | Owner action. |
| B2B measurement | No analytics script or B2B conversion event was found. `/caawi` has a separate consent-aware funnel, but it must not be treated as B2B analytics. | AQOON cannot tell whether buyers understood the offer or which page led to a qualified conversation. | Add data-minimised B2B events after choosing a privacy approach; combine with qualitative comprehension testing. | Measurement weakness | P1 / medium | Proposed, not implemented. |
| Long-form articles | Articles are readable HTML with useful links, but there is no measured evidence that the current topics match buyer search intent or lead to qualified contact. | Content volume could become work without commercial learning. | Maintain topic-to-buyer-question mapping and measure assisted qualified conversations. | Experiment requiring validation | P2 / medium | Proposed. |

## Homepage critique

### First screen

The first screen now does the essential work. The eyebrow names likely buyers. The headline says who AQOON helps and the outcome. The subheading explains the buyer problem, the practical work and the first purchasable step. The primary CTA says exactly what will happen and how long it takes. The secondary CTA routes buyers who need more certainty to services.

The remaining risk is not first-screen wording but belief: a buyer may understand the proposition and still need budget, procurement, capacity and repeatability answers. Those should be answered with evidence or a proposal, not by lengthening the hero.

### Section order

| Order | Section | Purpose | Decision |
|---:|---|---|---|
| 1 | Hero and bridge | Audience, outcome, problem, starting offer and CTA | Retain. Keep the diagram accessible and compact. |
| 2 | Problem | Make low participation concrete without blaming public services | Retain. |
| 3 | Offer | Separate Phase 1 from optional Phase 2 and name the buyer's output | Retain. Detailed scope belongs on Services. |
| 4 | Three-step method | Show the connected journey in plain language | Retain. Detailed channels and measurement belong on Method. |
| 5 | Concise evidence | Establish one verified outcome and the limit | Retain. Keep channel analytics on the case/insight pages. |
| 6 | Founder and safeguards | Show accountable expertise, independence, free family help and consent | Retain. Do not add anonymous decorative “team” portraits. |
| 7 | Closing CTA | Reconnect the service to the buyer's own broken step | Retain. |

Do not add detailed TikTok analytics, a full pilot methodology, an FAQ wall or repeated service cards to the homepage. The supporting pages already carry that work.

## Recommended Finnish homepage copy

The recommended version below is the concise copy already reflected in the homepage baseline. It should remain the working control while real-buyer comprehension is tested.

### Hero options

**A. Outcome-led, recommended**

- Headline: **Autamme somalinkielisiä perheitä ja aikuisia palvelunne alkuun.**
- Subheading: **AQOON selvittää, miksi ihmiset eivät löydä palveluanne tai pääse siinä eteenpäin. Tavoitamme, selitämme ja autamme hakemisessa. Aloitamme rajatulla kartoituksella ja pilotilla, jonka perusteella sovimme jatkosta.**
- Positioning: clearest answer to who benefits, what changes and what the buyer purchases first. It keeps the initial audience truthful.

**B. Buyer-problem-led**

- Headline: **Palvelulle voi olla tarvetta, vaikka hakijoita ei näy.**
- Subheading: **AQOON selvittää, missä somalinkielisten perheiden ja aikuisten reitti palveluun katkeaa, ja testaa käytännössä, miten tieto, hakeminen ja aloitus saadaan toimimaan.**
- Positioning: strongest for buyers already worried about low participation. It needs the audience and AQOON name close by because the headline alone does not state the service.

**C. Offer-led**

- Headline: **Selvitä ensin, miksi oikeat ihmiset eivät pääse palvelunne alkuun.**
- Subheading: **Kartoitamme somalinkielisen kohderyhmän kysymykset, nykyisen hakureitin ja tärkeimmät esteet. Rajattu pilotti näyttää, mitä kannattaa korjata ja kannattaako jatkuvasta toteutuksesta sopia.**
- Positioning: clearest procurement entry point, but it makes AQOON sound more like a research consultancy and understates practical guidance.

Recommendation: use A as the control. Test B only with buyers who already own a participation target. Do not rotate variants without enough traffic or a defined qualitative test.

### Complete control copy

**Audience line**

Kunnille, päiväkodeille, oppilaitoksille ja järjestöille

**Hero headline**

Autamme somalinkielisiä perheitä ja aikuisia palvelunne alkuun.

**Hero subheading**

AQOON selvittää, miksi ihmiset eivät löydä palveluanne tai pääse siinä eteenpäin. Tavoitamme, selitämme ja autamme hakemisessa. Aloitamme rajatulla kartoituksella ja pilotilla, jonka perusteella sovimme jatkosta.

**Primary CTA**

Varaa 30 minuutin keskustelu

**Secondary CTA**

Tutustu kartoitukseen ja pilottiin

**Problem**

Heading: Ihminen tuntee tarpeensa. Ei aina palveluanne.

Body: Vanhempi voi etsiä lapselleen harrastusta tai itselleen koulutusta tietämättä, mitä on tarjolla. Tieto voi jäädä näkemättä, hinta epäselväksi tai hakemus kesken. Teille tämä voi näkyä vähäisinä hakemuksina, vaikka palvelulle olisi tarvetta.

**Solution and buyer deliverable**

Heading: Selvitetään este ja kokeillaan reittiä.

Phase 1: Ensin kartoitus ja rajattu pilotti. Kuuntelemme kohderyhmää, käymme läpi nykyisen hakureitin ja testaamme sovittua tapaa tavoittaa ja auttaa ihmisiä. Saatte raportin havainnoista, etenemisen esteistä ja suositelluista seuraavista toimista.

Phase 2: Sen jälkeen sovittu toteutus. Jos jatko on perusteltu, sovimme tavoittamisesta, henkilökohtaisesta avusta ja seurannasta palvelun alkuun. Materiaalien kehitys ja henkilöstön valmennus sovitaan tarvittaessa erikseen.

Buyer value: Saatte perustan päättää, mitä kannattaa korjata ja mihin seuraavaksi panostaa. Jatkuvassa työssä näette erikseen yhteydenotot, tehdyt hakemukset ja varmennetut aloitukset.

**How it works**

Heading: Näin autamme eteenpäin.

1. Tavoitamme ja selitämme. Viemme hyödyllisen tiedon tuttuihin kanaviin ja vastaamme ihmisten kysymyksiin somaliksi. Yhteydenotto on vapaaehtoinen.
2. Selvitämme ja autamme. Tarkistamme palvelun ehdot ja oikean reitin. Autamme hakemuksen, liitteiden tai ilmoittautumisen kanssa.
3. Sovimme jatkon ja seuraamme. Varmistamme, kuka ottaa asian vastaan, ja tarkistamme sovitusti, toteutuiko aloitus. Tarvittaessa tuki jatkuu ensimmäisiin viikkoihin.

**Evidence and trust**

Heading: Pilke-pilotti teki esteet näkyviksi.

Body: Pilotissa selvitimme yksityisen päiväkodin hintaan, hakemiseen ja aloitukseen liittyviä epäselvyyksiä. Vähintään yksi reitti eteni yhteydenotosta lapsen aloitukseen. Pilotti osoitti, mitä käytännön tukea eteneminen voi vaatia. Se ei vielä osoita vakiintunutta tulostasoa.

**Team**

Heading: Yhteisön arjen ja palvelujen välissä.

Body: Olen Abducadir Aligure, AQOONin perustaja. Olen kasvanut Suomessa osana somaliyhteisöä ja auttanut perheitä ymmärtämään palveluja sekä hakemaan niihin. AQOONissa yhdistän käyttäjätutkimuksen, tavoittamisen ja käytännön avun.

Support: Tiimimme osaaminen kattaa kotoutumisen, koulutuksen, yhteisötyön ja hanketoteutuksen. Kokoonpano ja vastuut sovitaan toimeksiannon mukaan.

Safeguard: Perheen saama apu on maksutonta. Kaupallinen yhteistyö kerrotaan ennen suositusta, ja tietojen siirtoon pyydetään erillinen suostumus. Palveluntarjoaja tai viranomainen tekee päätöksen palveluun pääsystä.

**Closing CTA**

Heading: Missä teidän palvelunne polku katkeaa?

Body: Käydään 30 minuutissa läpi palvelunne, kohderyhmänne ja se, missä eteneminen pysähtyy. Arvioidaan, voisiko rajattu kartoitus ja pilotti auttaa.

CTA: Varaa 30 minuutin keskustelu

Alternative: Voit myös kirjoittaa: abducadir_abdullahi@aqoon.live

No sentence in this control copy requires new evidence beyond the cited current AQOON sources. Any future wording that promises a number of applicants, starts, response time, duration, capacity, cost or repeatable conversion requires additional evidence before publication.

## UX and visual design findings

The visual system is restrained and suitable for a Finnish professional-services buyer: strong condensed headings, warm neutral surfaces, thin rules, generous spacing and one recognisable teal accent. The layout does not try to simulate a large consultancy with stock photography or fabricated logos. That restraint should be retained.

At 320 and 390 px, the main homepage CTA remained within the first 844 px, the offer and evidence grids stacked, headings wrapped without arbitrary breaks and no horizontal overflow was measured. At approximately 768 px the two-column comparisons remained readable. At 1280 to 1363 px the navigation, content width and whitespace were balanced. The explicit booking label needs the mobile menu at 1100 px and below; the documentation now matches that behaviour.

The site does not need more card styles, animation or imagery. The useful refinements are functional: contrast, focus, hover confirmation and a recoverable error state.

## Accessibility findings

### Verified and corrected

- Normal text links using `#087D78` measured about 4.46:1 on cream and 4.10:1 on fog. Both fail the 4.5:1 threshold for normal text. They now use `#066C68` on light surfaces.
- Bright teal `#079D97` measured about 2.99:1 on cream in case-step labels and the focus outline. Functional text and focus now use `#066C68`; bright teal remains an accent.
- A dark CTA email link inherited a low-contrast inline teal in one context. Dark panels now force non-button links to the paper colour.
- The invalid-route experience had no AQOON recovery path. The custom 404 restores navigation, contact and the family/B2B distinction.

### Verified as working in the inspected scope

- Skip link is the first keyboard-focusable control, becomes visible on focus and moves focus to `main`.
- The sticky header did not obscure the focused main target in the tested desktop flow.
- Mobile menu exposes `aria-expanded`, closes after link activation and closes with Escape while returning focus to its button.
- One H1 and logical heading order were found on every inspected B2B route.
- Main navigation, footer navigation and main content landmarks were present.
- No horizontal overflow was measured at 320, 390, 768 or 1280 px in the responsive sample.
- B2B contact is link-based, so no in-site B2B form-label issue exists. The inspected Cal.com fields had accessible names. `/caawi`'s visible name and phone fields had explicit labels; its honeypot was hidden and removed from keyboard order.
- Founder image has intrinsic dimensions and meaningful alternative text. Decorative SVG marks are hidden from assistive technology.
- Mobile links, buttons and summaries are given 44 px minimum height in the shared narrow-width rules.
- Reduced-motion CSS disables animation and transitions. No movement was added to hover states.

This is not a claim of full WCAG conformance. It is a bounded browser, source and contrast review without a complete assistive-technology matrix.

## SEO and AI discoverability

- Titles and descriptions name the service, audience or page purpose. Canonicals resolve to `https://aqoon.live` routes.
- Pages use readable HTML with one H1 and descriptive headings, rather than hiding the proposition in a client-rendered application.
- `robots.txt` and the sitemap were present in the repository and public routes use `index,follow`; the new 404 uses `noindex,follow`.
- The homepage exposes Organization structured data, Services uses Service, articles use Article and supporting pages use WebPage.
- Internal links connect the homepage to services, method, case, insights, founder, privacy and responsibility pages.
- B2B and Somali family content have separate route intent. `/caawi` is not used as the organisation CTA.

These practices improve machine-readable clarity but do not guarantee search rankings or AI citations. Search intent should be tested against actual queries and qualified conversations, not page count.

## Performance findings

The site is a light static implementation. Before external font downloads, the inspected homepage transferred approximately 18 791 bytes of HTML, 14 410 bytes of shared CSS, 886 bytes of shared JavaScript and a 37 584-byte founder WebP, approximately 71 671 bytes in total. The image has explicit dimensions and is lazy-loaded below the fold.

No valid Lighthouse or field Core Web Vitals dataset was available in this environment. Controlled executor requests passed through a proxy and produced inconsistent roughly nine-second timings that did not match interactive browser rendering, so those values were rejected rather than reported as site performance. Future measurement should record field LCP, INP and CLS at the 75th percentile and supplement them with repeatable lab tests.

## External principles and comparisons

- [W3C Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) supports the 320 CSS px no-two-dimensional-scroll check.
- [W3C Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) supports checking focus against the sticky header.
- [W3C Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) sets 4.5:1 for normal text and 3:1 for large text and warns against rounding a failing result.
- [W3C Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) provides the 24 by 24 CSS px minimum or defined spacing exceptions. AQOON's 44 px mobile targets exceed this where the shared rule applies.
- [W3C form label guidance](https://www.w3.org/WAI/tutorials/forms/labels/) prefers explicit, visible labels. The guidance page was updated in 2024.
- [GOV.UK layout guidance](https://design-system.service.gov.uk/styles/layout/) begins with small screens and recommends restrained reading widths, generally no more than 75 characters. It applies because AQOON serves buyers and families who need public-service-style clarity, not marketing novelty.
- [Google's SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide), shown as updated 2025-12-10 during review, supports logical structure, people-first readable text, useful titles/descriptions and descriptive links.
- [web.dev Web Vitals](https://web.dev/articles/vitals) defines good 75th-percentile thresholds of LCP at most 2.5 seconds, INP at most 200 milliseconds and CLS at most 0.1. [Its measurement guidance](https://web.dev/articles/vitals-measurement-getting-started) supports combining field and lab evidence.
- [Nielsen Norman Group's historical reading study](https://www.nngroup.com/articles/how-users-read-on-the-web/) supports scanning, meaningful subheads, one idea per paragraph and front-loaded copy. It is historical research, not current conversion proof.
- In an [authorised excerpt from Tony Fadell's *Build*](https://www.fastcompany.com/90747313/steve-jobs-lessons-tony-fadell-build-book-excerpt), Fadell argues for explaining the customer problem and why it matters before product detail, and for one simple product story across touchpoints. This is applied as storytelling guidance, not empirical accessibility evidence.

Directional comparisons rendered on 2026-09-07:

- [Futurice](https://www.futurice.com/) and its [case studies](https://www.futurice.com/case-studies) and [public-sector page](https://www.futurice.com/industries/public-sector) show outcome-first professional-service hierarchy, clear categories and cases. It is much larger and more mature than AQOON, so case volume is not a fair benchmark.
- [Miltton](https://miltton.com/) and its [work page](https://miltton.com/work/) show a compact proposition, prominent contact and client/category labels. Its services page was intermittently inaccessible in the controlled browser. It is also a larger-firm reference.
- [Cultural Perspectives](https://www.culper.com.au/multicultural-communication-and-marketing-strategies) is a closer service-category example with a direct service statement, related projects and contact. It operates in a different market and regulatory context.

AQOON should borrow information discipline, not their scale signals or visual identity.

## Implementation brief

### Immediate corrections implemented

| File/component | Exact change | Dependency | Acceptance criterion |
|---|---|---|---|
| `assets/site.css` | Change functional light-background links and focus from legacy teal to `#066C68`; protect white dark-panel links; correct case/glossary labels; add non-moving hover feedback. | None. Bright `#079D97` remains decorative. | Measured normal text is at least 4.5:1, focus is at least 3:1 against adjacent light surfaces, dark CTA links remain readable, keyboard focus is visible. |
| `BRAND.md` | Document functional teal, decorative teal and the actual 1100 px navigation breakpoint. | Shared CSS behaviour. | Brand instructions no longer direct future work back to the failed contrast or colliding breakpoint. |
| `menetelma/index.html` | Replace vague closing invitation with the standard buyer problem, 30-minute agenda and email alternative. | Existing Cal.com and email destinations. | Closing section tells the buyer what will be discussed and offers two voluntary contact routes. |
| `tapaus/index.html` | Remove duplicated email alternative from the global footer. | None. | Exactly one `contact-alternative` remains in the page CTA. |
| `404.html` | Add branded Finnish recovery page with `noindex,follow`, main H1, B2B navigation, services, contact and `/caawi` route. | Vercel static 404 handling. | An unknown production URL returns the branded page without converting the route to HTTP 200; keyboard/mobile navigation works. |
| `tests/b2b-ux-ui-contract.test.js` | Add regression guards for contrast tokens, method CTA, duplicate contact and 404 recovery. | Node test runner. | Tests fail when any guarded contract is deliberately removed and pass after restoration. |

### Larger improvements and experiments

| Improvement | Required decision/evidence | Acceptance criterion |
|---|---|---|
| Correct Cal.com copy and language | Event-settings owner access | Description matches the bounded website promise and does not claim AQOON “kotouttaa” people. |
| Publish budget, duration and capacity boundaries | Agreed delivery model and economics | Values are truthful ranges with inclusions, exclusions and quote dependency. |
| Expand cases | Permissioned client evidence with dates and funnel definitions | Each case separates reach, contact, application, verified start and follow-through and states limitations. |
| Add B2B analytics | Tool, consent/legal basis, retention and privacy decision | Data-minimised events work, privacy text is updated and no family or buyer message content is captured. |
| Buyer comprehension study | Five to seven representative buyers across likely organisation types | Most can state audience, problem, Phase 1 output, evidence limit and next action without prompting. |

## Measurement plan

### Existing tracking

- No B2B analytics or B2B conversion events were found on the public organisation pages.
- `/caawi` has a separate consent-aware family funnel. It is not evidence that B2B pages are measured and its family records must not be repurposed as buyer analytics.
- Cal.com may maintain its own booking data, but no event export or privacy configuration was accessed in this audit.

### Proposed minimum measurement

| Measure | Definition | Why it matters | Better-page signal |
|---|---|---|---|
| First-exposure comprehension | After a short exposure, can a target buyer state what AQOON does, who it helps, what Phase 1 produces, what is proven and the next action? | Directly tests the website's primary job. | At least 5 of 7 can answer the five points without explanation, with no recurring false belief that AQOON sells leads or guarantees starts. |
| Qualified conversation rate | Completed conversations where the person represents a relevant organisation and brings a concrete audience/service-path problem, divided by B2B visits or reliably measured CTA sessions. | Optimises for useful buyer demand, not clicks alone. | A sustained increase with stable or better qualification. Do not judge on a tiny sample. |
| CTA progression | Privacy-safe counts of `outbound_booking_click` and `mailto_click`, carrying only page and CTA position. If available lawfully, separately count completed bookings. | Finds where intent is created and where booking friction begins. | More completed bookings per qualified visit without a rise in irrelevant enquiries. |
| Services-to-contact assisted path | Qualified conversations that included a Services, Method or Case page before contact. | Tests whether supporting detail helps rather than distracts. | Buyers who need detail can reach contact without repeated backtracking or unanswered scope questions. |
| Objection themes | PII-minimised tags after conversations: price, timing, capacity, proof, procurement, responsibility, audience fit. | Converts sales learning into website priorities. | Fewer repeated “what do I actually receive?” objections; remaining objections are commercial decisions rather than comprehension failures. |

Suggested events, only after privacy approval: `b2b_cta_click` with page and position, `b2b_email_click` with page, and `b2b_booking_complete` only through an authorised Cal.com integration. Do not capture names, emails, message text or family information in page analytics.

## Coverage

### Pages rendered

All 19 public B2B routes were rendered at 1363 by 936:

- `/`, `/paketit`, `/menetelma`, `/tapaus`, `/havainnot`
- `/havainnot/hankkeen-kohderyhman-tavoittaminen`
- `/havainnot/maahanmuuttajien-tavoittaminen`
- `/havainnot/miksi-hyva-palvelu-ei-tavoita`
- `/havainnot/miksi-kaannos-ei-riita`
- `/havainnot/miksi-kampanja-myohastyy`
- `/havainnot/miksi-linkki-ei-ole-ohjausta`
- `/havainnot/miksi-tuttu-kanava-toimii`
- `/havainnot/miten-palvelupolkua-mitataan`
- `/havainnot/miten-somalinkielinen-yleiso-loytaa-palvelut`
- `/havainnot/yhteisolahtoinen-vaikuttajamarkkinointi`
- `/sanasto`, `/meista`, `/tietosuoja`, `/disclaimer`

Responsive complete-page inspection covered `/`, `/paketit`, `/menetelma`, `/tapaus`, `/havainnot`, `/meista` and `/caawi/xog` at 320, 390, 768 and 1280 px. Final preview verification adds 1024 px and the new 404. Key full-page visuals were separately inspected for the homepage, Services, Method, Case, Insights, About and Privacy pages.

### Interactions checked

- Desktop navigation and all global destinations.
- Mobile menu open, close, link activation and Escape behaviour.
- Skip link, focus order, visible focus and main-content target with sticky header.
- Primary and secondary homepage CTAs.
- Services, Method, Case, Insights and About paths to contact.
- External Cal.com event page, date/time path and accessible names for name, email and notes, without submission.
- Footer email and phone links, without sending a message or starting a call.
- `/caawi` and `/caawi/xog` separation from B2B navigation; visible family-form labels, without submission.
- Unknown URL error state.
- Heading order, landmarks, duplicate IDs, canonical, metadata, structured data, image alternative text and horizontal overflow.

### Limitations and unresolved questions

- No contact form or booking was submitted.
- The Cal.com settings were not accessible, so stale booking copy was documented but not changed.
- No Lighthouse score, assistive-technology matrix or trustworthy field Core Web Vitals dataset was available. Full WCAG conformance is not claimed.
- Browser console output contained extension metadata errors but no observed site-origin error. That is not equivalent to long-term production error monitoring.
- Miltton's services page was intermittently inaccessible in the browser.
- Price, duration, capacity, named delivery-team availability and procurement requirements need business decisions.
- Evidence supports the Somali-speaking starting audience. Effectiveness for other language groups remains a hypothesis.
- Faceless content is a valid tested format. Showing the founder's face in future media is optional, not an audit requirement.
- Protected Pilke pages and authenticated tracker functionality remained outside the public-site audit.

## Verification record

The pre-deployment verification record will be completed after the clean preview pass. Production commit, GitHub Actions and Vercel exact-deployment identifiers will then be recorded here or in the release handoff without implying that a Git commit alone is live.
