# Live national programmes and hankkeet routes — Pass 9

Checked: 2026-08-29. Geography: Finland, national programmes only (no municipal-specific programmes extracted in this pass). Population: families and adults who may benefit from a live public programme, grant round or hanke, and organisations navigating STEA/STM/EU funding structures.

These are **discovery routes, not standing entitlements**. Per the coverage register, "Live discovery only" domains require recurring discovery, source checks, expiry monitoring and reviewer publication rather than a one-time verified claim. Every route below must be rechecked against the current official page before it guides a real family or organisation, and none of them may be used to promise a funded outcome.

## route.live-programmes.youth-employment-support

**Goal:** help a family with an unemployed 18–29-year-old, or an employer they are talking to, learn about the youth employment voucher.

**Required facts:** applicant age (18–29), current unemployment/jobseeker status, whether an interested employer exists.

**Authority:** TE-palvelut / TEM decide voucher terms; the employer decides whether to use it.

**Official next step:** contact TE-palvelut and review the current TEM nuorten työllistymisseteli page with any employer involved.

**AQOON may do:** explain the voucher exists and its target group, link the official TEM page, suggest raising it with an employer.

**AQOON must not do:** promise the voucher will be approved, promise a job outcome, or state a firm remaining application deadline without rereading the current page.

**Source IDs:** `src.tem.nuorten-tyollistymisseteli`.

**Recheck:** every case — application windows for youth-employment measures change with annual budgets.

## route.live-programmes.family-movement-suomi-liikkeelle

**Goal:** help a family learn whether their daycare, school or a local organisation runs a Suomi liikkeelle-funded movement activity.

**Required facts:** child's age/setting (daycare, school), municipality, whether the family already has a movement/hobby need identified.

**Authority:** OKM funds the programme; the specific project (daycare, municipality or organisation) decides participation.

**Official next step:** ask the child's daycare/school directly, or check OKM's current Suomi liikkeelle page and the organisation's own call information.

**AQOON may do:** explain the programme exists nationally, explain the scale of funding, and suggest asking the daycare/school/organisation whether they participate.

**AQOON must not do:** promise a funded place, promise the family's own daycare participates without checking, or quote a euro amount as something the family personally receives.

**Source IDs:** `src.okm.suomi-liikkeelle-rahoitus-2026`.

**Recheck:** every case — this is an annual budget allocation, not a permanent local guarantee.

## route.live-programmes.youth-drug-prevention

**Goal:** help a family concerned about a young person's drug-use risk learn that prevention projects exist and reach an official channel.

**Required facts:** the family's concern/consent to discuss it, general location (to judge relevance of the Helsinki/Oulu/national projects).

**Authority:** STEA/STM fund the projects; THL and the individual projects decide intake.

**Official next step:** direct the family to THL/STEA's current contact information; this is not a route AQOON can complete end-to-end without a live official contact for the specific project.

**AQOON may do:** mention that funded prevention projects exist for 2026–2028 and that this is an STM/STEA/THL-backed effort.

**AQOON must not do:** name a project as accepting a specific young person, promise treatment or outcome, or treat this as a general drug-help hotline replacement.

**Source IDs:** `src.stea.nuorten-huumehankkeet-2026`.

**Recheck:** every case — project names, capacity and intake criteria are `verification_pending` beyond the top-level announcement.

## route.live-programmes.ngo-and-eu-funding-signpost

**Goal:** help an organisation (not a family directly) understand what national/EU funding structures exist for social-welfare, health or employment-related project work.

**Required facts:** organisation type, whether the project idea fits STEA's remaining new-project categories (EU co-financing, youth drug-harm prevention) or a broader ESR+/EAKR priority line.

**Authority:** STEA/STM decide grant funding; ELY centres coordinate EU structural-fund calls via EURA2021.

**Official next step:** check the current STEA/STM decision pages and EURA2021 for open calls; contact the relevant regional ELY centre.

**AQOON may do:** explain the funding structure and the two categories where STEA is currently funding new projects; point to EURA2021 and the regional ELY centre for EU calls.

**AQOON must not do:** claim a specific call is open without checking EURA2021, or suggest an organisation is likely to receive funding.

**Source IDs:** `src.stea.avustusehdotus-2026`, `src.stm.jarjestoavustukset-2026`, `src.stm.eu-rakennerahastot-2021-2027`.

**Recheck:** every case — STEA's decision and EURA2021's open-call list change on their own schedules.

## Route matrix

| Family/org goal | Required facts | Authority | Official next step | AQOON may do | AQOON must not do | Recheck |
|---|---|---|---|---|---|---|
| Youth employment support | age 18–29, jobseeker status, employer interest | TE-palvelut/TEM; employer | TE-palvelut + current TEM voucher page | inform, link, suggest raising with employer | promise approval/job | every case |
| Family movement / hobbies (Suomi liikkeelle) | child setting, municipality, movement need | OKM; local project | ask daycare/school/organisation; OKM page | inform, suggest asking locally | promise a funded place | every case |
| Youth drug-risk prevention | family concern/consent, location | STEA/STM; THL; project | THL/STEA current contact | mention projects exist, signpost | promise a specific project will help this young person | every case |
| NGO/EU project funding | organisation type, project fit | STEA/STM; ELY centres | STEA/STM pages; EURA2021; regional ELY | explain structure, signpost | claim a call is open without checking | every case |

## Operator questions — information gathering, not eligibility questions

- Onko teillä kotioloissa tai lapsen koulunkäynnissä tarvetta lisäliikunnalle tai harrastuksille? Oletteko kuulleet Suomi liikkeelle -ohjelman tuesta?
- Onko perheessänne alle 30-vuotias työtön nuori? Tietääkö perheenne nuorten työllistymissetelistä?
- Onko perheenne kohdannut huolta nuoren huumeiden käytöstä? Haluatteko tietoa ennaltaehkäisyhankkeista ja tukimuodoista?
- (Organisation contact) Haluatteko tietoa STEA:n tai EU:n rahoittamista hankemahdollisuuksista?

These are neutral, informing questions used to route a family or organisation to the correct official channel — never a decision AQOON makes itself, and never stored with an implication that the person will receive funding.

## PII-free outcome evidence

- **Informed:** the family/organisation was told a relevant programme exists and was pointed to the correct official page/authority.
- **Assisted action:** the family/organisation contacted the official channel (TE-palvelut, daycare/school/organisation, STEA/THL, ELY centre) themselves, or started the official process, with their approval.
- **Verified outcome:** confirmed acceptance/participation/decision, evidenced only in the protected private case system — never copied to public GitHub.
- **Persistence:** later follow-up confirms whether the family/organisation is still participating or what happened to the application; this route's aggregate reporting records status categories only.

## Gaps / verification pending

- Exact application windows, deadlines and per-project capacity for all four programmes above are not extracted and must be rechecked at case time.
- Municipal/city-level programmes (e.g. city-specific youth-employment or family-movement funding in Helsinki, Espoo, Vantaa, Tampere) are out of scope for this pass and remain a Pass 9 follow-up item.
- A systematic partner/funder inventory (EU Horizon, Erasmus+, Business Finland, Sitra, church/parish aid, private foundations) has not been built; this pass covers only the six sources confirmed in `sources/pass9-live-programmes-2026.md`.
- Intake criteria and current contact points for the three named youth drug-harm-prevention projects are `verification_pending`.

## Human review gate

Required before these live-programme records are used to guide a real family or organisation. A human reviewer should reconfirm each application window is still open and each project is still accepting referrals before any operator-facing publication, per this workspace's rule against silently publishing official-looking advice from an automated pass.
