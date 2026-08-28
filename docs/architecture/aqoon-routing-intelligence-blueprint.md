# AQOON Routing Intelligence — blueprint

## Decision

Build AQOON's reusable internal knowledge base as a **verified routing system**, not a general AI search archive and not an eligibility-decision engine.

Its purpose is to make a first interview faster and more consistent:

`structured family facts -> current verified routes -> explicit match status -> operator review -> next action -> outcome -> PII-free reusable learning`

AQOON may explain, navigate, compare and help prepare an application. The municipality, authority, provider, school, employer or fund makes the decision. A match is never a promise.

## The three boundaries

| Layer | Contains | Home | Never contains |
|---|---|---|---|
| Family case | Contact, interview answers, documents/status, promises and follow-ups | protected Supabase CRM | public GitHub or anonymous analytics |
| Verified route knowledge | Sources, services, criteria, steps, scope, freshness, partner disclosure and operator guidance | versioned internal knowledge records, later protected Supabase tables | family-specific facts or copied private notes |
| PII-free learning | Reusable scenario dimensions, verified answer, source list and recheck date | `family_scenarios` + `family_scenario_research` | name, phone, address, exact family story |

Commercial partner records are an attribute of a route, not the route itself. The municipal/official route remains visible when a partner route is relevant. Before the family acts on a paid recommendation, AQOON discloses the relationship.

## Canonical record set

The existing `_core/schemas/` are the correct starting vocabulary. The protected database should mirror them rather than invent a second set of meanings.

1. **Source** — one current official/provider page or document; publisher, URL, retrieval/check date, volatility, status and recheck interval.
2. **Authority** — the city, Kela, employment authority, school/provider or other body with power to decide.
3. **Service** — a stable service such as Vantaa early childhood education, S2, jobseeker registration or Harrastusten Vantaa.
4. **Route** — a practical path through the service for a particular need/scope, with required and blocking inputs, steps and decision-maker.
5. **Criteria** — only the facts that materially affect the route. Each criterion points back to its source.
6. **Programme/provider** — a time-sensitive opening, provider or partner opportunity. It is not treated as permanently open.
7. **Match run** — private, dated result for one family: facts used, candidates, confirmed/unknown/conflicting criteria, sources checked, operator and next action.
8. **Outcome/evidence** — separate measured action or outcome records, never confused with source truth or eligibility.

## Matching contract

The system must return three possible labels only:

- `confirmed-match`: currently published criteria fit all known material facts.
- `possible-must-confirm`: promising, but a material fact is missing or a provider/authority has discretion.
- `does-not-fit`: a current published criterion conflicts.

Before a route can be shown as confirmed, it needs a current active source, no expired recheck date, all required inputs and no blocker. If information is stale or missing, the system gives the operator an **ask-next** question or a **verify-now** task instead of a fake recommendation.

## First Vantaa knowledge pack

This is the initial set to research, enter and test before expanding nationally.

### 1. Daycare and early childhood

- **Official routes:** Vantaa municipal early childhood education; Vantaa private early childhood education/service voucher; preschool as a distinct route.
- **Matching facts:** municipality, child age/date of birth, desired start date, care need/schedule, current care/application status, preferred area/provider, guardian contact/application capability, and family questions about cost/support.
- **Do not infer:** a place, exact fee, service-voucher amount, provider availability or acceptance.
- **Partner logic:** check the official service-voucher route and provider availability first. A Pilke option can be presented only as an optional relevant provider route with disclosure; it does not replace the Vantaa route.
- **Evidence seed:** Vantaa says the service voucher is applied for in Vasa using the same early-childhood application, with the chosen private daycare as first preference; the provider must be approved for Vantaa's voucher system. Vantaa also says August-start decisions are made in May and other-month decisions about a month before the start. Recheck availability and fee/value at case time. [Vantaa: service voucher](https://www.vantaa.fi/fi/yksityisen-varhaiskasvatuksen-palveluseteli) · [Vantaa: applying](https://www.vantaa.fi/fi/kasvatus-ja-koulutus/varhaiskasvatus/varhaiskasvatukseen-hakeminen)

### 2. School, S2 and learning support

- **Official routes:** Vantaa basic education, school-specific S2, learning support and school contact route.
- **Matching facts:** municipality/address or school, grade/age, current school/enrolment status, language-learning concern, support need as described by the family, and urgency/deadline.
- **Do not infer:** an S2 placement, special-support decision or school placement.
- **Evidence seed:** Vantaa school pages describe S2 as an alternative to the mother-tongue-and-literature syllabus when Finnish is not at native-language level; the exact education arrangement is school/education-provider practice. Store a city-level canonical service record and link school pages only as local evidence. [Vantaa: S2 example](https://www.vantaa.fi/fi/palveluhakemisto/toimipiste/martinlaakson-koulu)

### 3. Free hobbies

- **Official route:** Harrastusten Vantaa, plus separate city youth/hobby-calendar offerings.
- **Matching facts:** school-age/grade, municipality/school, area, interests, availability, accessibility/support needs and registration status.
- **Do not infer:** a place, a particular programme's availability or that every hobby is free.
- **Evidence seed:** Harrastusten Vantaa describes free, low-threshold opportunities for comprehensive-school-age children and young people during the school day. Individual offerings remain live programmes and must be rechecked. [Vantaa: Harrastusten Vantaa](https://www.vantaa.fi/fi/harrastusten-vantaa)

### 4. Work and integration entry

- **Official route:** Työmarkkinatori's jobseeker transaction service and the responsible employment authority; subsequent training/programme/job options are separate live candidates.
- **Matching facts:** work status, planned unemployment date, jobseeker registration status/date, right-to-work facts only when relevant, education/skills, language, availability, childcare, municipality and goal.
- **Do not infer:** unemployment benefit, a job, programme admission, work-right outcome or a subsidy decision.
- **Evidence seed:** Työmarkkinatori states that jobseeker registration is done in Asiointi and should be completed no later than the first day of unemployment for unemployment-security timing. From 1 September 2026, a new jobseeker generally has 15 working days to complete and publish the jobseeker profile, with statutory exceptions. [Työmarkkinatori: registration](https://tyomarkkinatori.fi/henkiloasiakkaat/tietoa-tyoelamasta/tyonhaku/ilmoittautuminen-tyonhakijaksi) · [profile change](https://tyomarkkinatori.fi/uutiset/tyonhakuprofiili-tulee-osaksi-tyonhakua-1-9-alkaen)

## Operator workflow

1. Contact/intake creates a private family record.
2. First interview asks only route-changing facts; evidence questions remain separate from eligibility facts.
3. The tracker creates a private match run and searches current verified records first.
4. If the record is stale or facts are missing, it generates a small verification task—not a broad AI search.
5. The operator reviews the result with the family, makes the next action, and records consent separately for relevant updates, outcome follow-up and any partner handoff.
6. Repeated cases create or update a PII-free scenario only after a human has saved a source-backed verified answer.
7. A public Somali page or TikTok idea may be proposed from the route, but publication stays a separate reviewed action.

## Delivery sequence — do not skip

1. Capture the four missing live Edge Function sources in Git and compare their payloads to the current CRM contract.
2. Consolidate the overlapping interview layers into one canonical field dictionary; preserve old answers with a schema-version map.
3. Define and approve the protected knowledge-table schema, RLS/service-role boundary, source-ingestion review flow and match-run audit trail.
4. Enter and verify the four Vantaa packs above, with one owner and recheck date per record.
5. Build read-only tracker search and match preview for operators.
6. Run ten real Vantaa cases manually alongside the preview; measure missing facts, wrong suggestions, time saved and outcomes.
7. Only then enable semi-automated matching and expand to Helsinki, Espoo and national routes.

## Explicit non-goals for the first release

- no automatic authority/provider decision or benefit calculation;
- no public exposure of family data or internal research;
- no scraping or treating live programmes as timeless records;
- no automatic partner referral without separate disclosure/consent;
- no replacement of human review for a case-specific route.
