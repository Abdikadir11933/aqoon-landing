# Interview and intake field reference

This is the concrete field inventory behind the routing intelligence design in
`aqoon-routing-intelligence-blueprint.md`: every field the public intake and
the operator's first interview actually collect, the DB/answer key each one
is stored under, and how each currently-seeded verified route resolves its
required facts against them. Generated from the live source (`caawi/app.js`,
`tracker/interview-match.js`, `supabase/functions/family-leads-admin/index.ts`,
and the `knowledge_routes`/`knowledge_criteria` tables) on 2026-08-30 — if the
code changes, this table goes stale and should be regenerated the same way
(see the "How this was built" note at the end), not hand-edited to match a
guess.

## 1. Public intake (`caawi/app.js`)

Collected before any operator contact. No eligibility question belongs here —
see `caawi/CONTEXT.md` and `_core/qa/terminology-rules.md`.

| Field | Storage | Type | Values | Required |
|---|---|---|---|---|
| Name | `family_leads.name` | text | free text | Yes |
| Phone | `family_leads.phone` | tel | free text, normalized | Yes |
| City | `family_leads.city` | select | Vantaa, Helsinki, Espoo, Tampere, or free text via "Meel kale" | Yes |
| Main category | `family_leads.main_need` | select | Carruur iyo skuul, Shaqo, Waxbarasho, Arrin kale | Yes |
| Child age bucket (only when main category is Carruur iyo skuul) | `family_leads.age_group` | select | `under7` (xannaano/esiopetus), `over7` (skuul) | Conditional |
| Subcategory | `family_leads.sub_need` | select | one of `SUBS[bucket]` — see below | Yes |
| Additional needs (repeat the category → subcategory step) | `family_leads.additional_needs` (jsonb array) | array of `{main_need, sub_need, age_group}` | same as above, one per added need | No |
| Consent to be contacted | `family_leads.consent_relevant_updates_ok` / `consent_outcome_followup_ok` (recorded at first-interview save, not intake — the intake checkbox gates submission but the DB consent columns are set from `answers.relevant_updates_ok`/`outcome_followup_ok` during `save_interview`) | checkbox | gates the send button; unchecked blocks submit | Yes |

Subcategory options (`SUBS`), by bucket:

- **daycare** (Carruur iyo skuul + under7): Päiväkoti ama xannaano, Esiopetus, Codsi ama diiwaangelin, Ciyaar ama harrastus
- **school_child** (Carruur iyo skuul + over7): Skuulka iyo taageerada ilmaha, Harrastus ama ciyaar, Wilma ama fariin skuul, Codsi ama diiwaangelin
- **work** (Shaqo): Shaqo raadis, CV ama codsi shaqo, Tababar ama xirfad, Bilaabidda ganacsi
- **school** (Waxbarasho): Barashada Finnish-ka, YKI, Waxbarasho ama shahaado, Wax kale oo waxbarasho ah
- **other** (Arrin kale): no subcategory screen — recorded directly as sub_need `"Wax aan kor ku qornayn"`

## 2. Need → first-interview topic routing

`rt()` in `tracker/interview-match.js` maps each recorded need (main + sub,
and separately per entry in `additional_needs`) to one of 9 interview topics
by matching `main_need`/`sub_need` text (Somali and English keyword patterns):
`entrepreneurship`, `daycare`, `school_child`, `hobby`, `education`, `work`,
`service_support`, `program`, `general`. A lead can carry more than one topic
at once when it has multiple needs; `core` fields are added whenever any
adult-facing topic (`work`, `education`, `entrepreneurship`, `program`,
`service_support`, `general`) is present.

This routing is independent of, and uses different topic names than, the
`need_domain` vocabulary in `knowledge_routes` (section 4) — see the gap note
there.

## 3. First-interview question fields, by topic

Every question the operator can be shown once a topic is active, with its
answer key (as stored in `family_interviews.answers`), question text, input
type, option list, and whether it's required before the interview can be
saved (`missing()` in `interview-match.js` blocks save on any required field
without a value).

### core

| field_key | Question | Type | Options | Required for matching |
|---|---|---|---|---|
| `client_age` | Exact age of the adult/client? | number | — | Yes |
| `home_municipality` | Is the intake city their registered kotikunta? | select | Yes; No; Not sure | Yes |

### work

| field_key | Question | Type | Options | Required for matching |
|---|---|---|---|---|
| `primary_situation` | What is the person’s main situation right now? | select | Studying; Working; Unemployed / seeking work; Other / mixed; Not sure | Yes |
| `work_search_scope` | Is today about one opportunity or wider work support? | select | One specific job / pilot / shift; Ongoing job search; Work plus training options; Not sure | Yes |
| `work_intent` | What kind of work are they looking for? | select | Part-time; Full-time; Both; Occasional / flexible; Not sure | Yes |
| `qualification_status` | What qualification have they already completed? | select | No completed vocational or degree qualification; Basic education only; Qualification outside Finland; Finnish vocational or degree qualification; Not sure | Yes, only when `work_search_scope = Work plus training options` |
| `work_study_route` | Which work-and-study route should AQOON compare? | select | Oppisopimus; vocational continuous application; labour-market training; work first; compare all; not sure | Yes, only when `work_search_scope = Work plus training options` |
| `training_schedule` | What study schedule is realistically possible? | multi | Weekday daytime only; part-time daytime; evenings; full-time; online/hybrid; not sure | Yes, only when `work_search_scope = Work plus training options` |
| `jobseeker_active` | Is job search currently active in local employment services / Työmarkkinatori? | select | Yes – active; Registered, active status not sure; No; Not sure | Yes |
| `unemployment_duration` | How long unemployed? | select | Not unemployed; Under 3 months; 3–6 months; 6–12 months; 12–24 months; 24+ months; Not sure | Yes |
| `employment_plan` | Current employment plan with employment services? | select | Yes; No; Not sure | Yes |
| `integration_plan` | Active kotoutumissuunnitelma? | select | Yes; No; Not sure | No |
| `right_to_work_known` | Right to work for the target jobs already confirmed/known? | select | Yes; No; Not sure – verify | Yes |
| `palkkatuki` | Has employment services written/said that palkkatuki may apply? | select | Written/confirmed by employment services; Said it may be possible; No; Not sure | Yes |
| `availability` | Realistic work times? | multi | Full-time; Part-time; Day; Evening; Night; Weekend | Yes |
| `start_when` | When can they start? | select | Immediately; Within 2 weeks; Within 1 month; Later | Yes |
| `travel_limit` | Travel limit? | select | Own city; Capital region / nearby; ~30 min; ~60 min; Flexible | Yes |
| `childcare_limit` | Childcare constraint? | select | None; Daytime only; Need childcare/daycare first; Other / not sure | Yes |
| `work_tryout` | Open to työkokeilu if employment services agrees? | select | Yes; No; Maybe | No |
| `apprenticeship` | Open to oppisopimus? | select | Yes; No; Maybe | No |

`operator_context_notes` stores the operator's additional free-text context in
the same private `answers` object. It is restored on follow-up and included in
the human-readable summary/research brief, but it is deliberately excluded
from automatic reusable-scenario fingerprints; route-changing facts still
need an approved structured answer.

### entrepreneurship

| field_key | Question | Type | Options | Required for matching |
|---|---|---|---|---|
| `business_stage` | Business stage? | select | Idea; Planning/business plan; Registered, not full-time; Part-time operating; Full-time already started; Not sure | Yes |
| `fulltime_started` | Has full-time business already started/expanded to full-time? | select | Yes; No; Not sure | Yes |
| `business_idea` | What does the business sell and to whom? | text | — | Yes |
| `business_plan` | Business plan status? | select | Ready; Draft; Not started; Not sure | Yes |
| `business_numbers` | Profitability/income-cost calculations done? | select | Yes; No; Not sure | Yes |
| `starttiraha` | Starttiraha status? | select | Applied; Discussed with employment services; Not yet; Not sure | Yes |
| `business_start` | Planned full-time start date? | date | — | No |
| `business_help` | Help needed? | multi | Business plan; Calculations; Starttiraha; Y-tunnus/registration; Permits; Financing; Customers/sales; Training | Yes |

### education

| field_key | Question | Type | Options | Required for matching |
|---|---|---|---|---|
| `integration_plan` | Active kotoutumissuunnitelma? | select | Yes; No; Not sure | No |
| `literacy` | Reading/writing with Latin alphabet? | select | Comfortable; Some difficulty; Major difficulty; Not sure | Yes |
| `basic_school` | Basic education/equivalent completed? | select | Yes; No; Not sure | Yes |
| `current_study` | Current study/course? | select | No; Finnish course; Integration training; Vocational; Other; Not sure | Yes |
| `study_language` | Possible study languages? | multi | Finnish; English; Swedish; Not sure | Yes |
| `study_load` | Possible study format? | multi | Full-time; Part-time; Day; Evening; Online/hybrid | Yes |
| `study_travel` | Travel limit for studies? | select | Own city; Capital region / nearby; ~30 min; ~60 min; Flexible | Yes |
| `study_start` | Desired start? | select | ASAP; This autumn; This spring; Within 6 months; Flexible | Yes |
| `yki_purpose` | If YKI matters, purpose? | select | Citizenship; Work; Study; Professional requirement; Personal; Not relevant/not sure | No |
| `yki_level` | If YKI matters, target level? | select | Basic; Intermediate; Advanced; Not sure; Not relevant | No |

### daycare

| field_key | Question | Type | Options | Required for matching |
|---|---|---|---|---|
| `home_municipality` | Is intake city the child’s registered municipality? | select | Yes; No; Not sure | Yes |
| `care_goal` | Need? | select | Päiväkoti; Esiopetus; Esiopetus + daycare; Application help; Not sure | Yes |
| `care_schedule` | Required care times? | multi | Weekday full-day; Weekday part-day; Early morning; Evening; Night; Weekend | Yes |
| `application_date` | If already applied, application date? | date | — | No |
| `sudden_need` | Is the need genuinely sudden/unforeseen? | select | Yes; No; Not sure | Yes |
| `all_guardians` | Are all guardians unavailable during needed hours for work/study/accepted reason? | select | Yes; No; Not sure | No |
| `urgent_proof` | If urgent route: written proof available? | select | Yes; No; Not sure; Not relevant | Yes |
| `care_options` | Options family can consider? | multi | Municipal; Private; Palveluseteli; Family daycare; No preference | Yes |
| `cost_priority` | Cost constraint? | select | Lowest-cost needed; Private possible depending fee; Cost not main constraint; Not sure | Yes |
| `support_arrangement` | Support/accessibility arrangement provider must confirm? | select | No; Yes – confirm; Not sure / discuss separately | Yes |

### hobby

| field_key | Question | Type | Options | Required for matching |
|---|---|---|---|---|
| `grade` | School grade? | select | 1; 2; 3; 4; 5; 6; 7; 8; 9; Other/not sure | Yes |
| `school_name` | School name? | text | — | Yes |
| `home_municipality` | Is intake city the child’s municipality? | select | Yes; No; Not sure | Yes |
| `days` | Possible days? | multi | Mon; Tue; Wed; Thu; Fri; Weekend; Flexible | Yes |
| `hobby_time` | Possible time? | select | After school; Late afternoon; Evening; Flexible | Yes |
| `other_school` | Can child attend a group at another school if allowed? | select | Yes; No; Not sure | Yes |
| `hobby_language` | Instruction languages okay? | multi | Finnish; English; Swedish; Any/not important | No |
| `accessibility` | Accessibility/support need organiser must confirm? | select | No; Yes – confirm; Not sure | No |
| `registration` | Already tried to register? | select | No; Waiting; Group full; Registered; Not sure | No |

### school_child

| field_key | Question | Type | Options | Required for matching |
|---|---|---|---|---|
| `grade` | Current grade/year? | text | — | Yes |
| `home_municipality` | Is intake city the child’s municipality? | select | Yes; No; Not sure | Yes |
| `born_finland` | Was the child born in Finland? | select | Yes; No; Not sure | Yes |
| `fin_school_time` | Time in Finnish school/esiopetus? | select | Not started; <6 months; 6–12 months; 1–2 years; 2+ years; Not sure | Yes |
| `school_route` | Current route? | select | Valmistava; Basic education; Esiopetus; TUVA; Not sure | Yes |
| `child_finnish` | Finnish for learning? | select | Very little; Basic everyday; Some lessons; Mostly comfortable; Not sure | Yes |
| `s2` | Currently S2? | select | Yes; No; Not sure | Yes |
| `support_tried` | What support already tried/discussed? | multi | Group support; Extra/remedial teaching; S2; Pupil-specific support; Special teacher/small group; Meeting only; Nothing; Not sure | Yes |
| `support_decision` | Assessment/decision for pupil-specific support? | select | Decision exists; Assessment started; No; Not sure | Yes |
| `school_deadline` | Upcoming meeting/deadline/transition date? | text | — | No |
| `school_goal` | What should happen next? | multi | Understand current support; Ask for meeting; Check S2/valmistava; Start/review support; Understand Wilma/decision; Other | Yes |

### program

| field_key | Question | Type | Options | Required for matching |
|---|---|---|---|---|
| `jobseeker_active` | Active jobseeker? | select | Yes – active; Registered, active status not sure; No; Not sure | Yes |
| `integration_plan` | Active kotoutumissuunnitelma? | select | Yes; No; Not sure | Yes |
| `integration_assessment` | Integration/skills service-needs assessment done? | select | Yes; No; Not sure | No |
| `residence_status` | Valid residence permit/right of residence or pending extension known? | select | Yes; No; Not sure – authority must verify | Yes |
| `first_permit_time` | Time since first residence permit/right-of-residence registration? | select | <1 year; 1–3 years; 3+ years; Not sure | Yes |
| `finnish_match` | Finnish level? | select | Almost none; Basic; Daily life; Intermediate; Advanced; Not sure | Yes |
| `literacy` | Reading/writing with Latin alphabet? | select | Comfortable; Some difficulty; Major difficulty; Not sure | Yes |
| `parent_status` | Caring for children at home? | select | No; Child under 3; Child 3–6; School-age child; Not sure | Yes |
| `kotihoidon_tuki` | If home parent: receiving kotihoidon tuki? | select | Yes; No; Not sure; Not relevant | No |
| `program_goal` | Programme should help with? | multi | Finnish; Employment; Job search; Vocational training; Qualification; Entrepreneurship; Digital skills; Finnish society; Parent/family; Community/social | Yes |
| `program_time` | Participation times? | multi | Weekday day; Evening; Weekend; Part-time only; Full-time possible; Online | Yes |
| `program_childcare` | Need childcare to participate? | select | No; Yes – must be provided; Family can arrange; Not sure | Yes |
| `program_cost` | Cost possible? | select | Must be free; Small fee okay; Paid okay; Not sure | Yes |
| `program_travel` | Travel limit? | select | Own city; Capital region/nearby; ~60 min; Online preferred; Flexible | Yes |

### service_support

| field_key | Question | Type | Options | Required for matching |
|---|---|---|---|---|
| `service_area` | Which system owns the issue? | select | Kela; Employment services/Työmarkkinatori; Migri; Municipality; Päiväkoti/school; Housing; Contract/bill; Other; Not sure | Yes |
| `case_status` | Case stage? | select | Not started; Applied; More information requested; Decision received; Payment/service changed/stopped; Deadline/appeal period running; Not sure | Yes |
| `decision_date` | Decision/letter date? | date | — | No |
| `response_deadline` | Visible reply/document/appeal deadline? | text | — | No |
| `support_goal` | Help needed? | multi | Understand letter/decision; Find official form/page; Prepare application; Know requested documents; Contact correct authority; Prepare questions; Understand next step | Yes |
| `authority_contacted` | Authority already contacted? | select | Yes; No; Not sure | Yes |

### general

| field_key | Question | Type | Options | Required for matching |
|---|---|---|---|---|
| `known_service` | Known authority/service/programme? | text | — | No |
| `already_tried` | What has already been tried? | text | — | No |

## 4. Verified routes seeded today, and how their required facts resolve

`family-leads-admin`'s `match_preview` action (called by `interview-match-
preview.js`, loaded in the tracker as of the commit this doc was written
against) is the only live code path that reads `knowledge_routes`/
`knowledge_criteria`. It classifies the lead's need text into one or more
`need_domain` values (`needDomains()`), fetches every `verified` route in
those domains, and for each `required_input` key checks whether it already
has a value — either because an existing interview answer key means the same
thing (`CRITERIA_BRIDGE`, defined next to `needDomains()`), a lead field
covers it (`city`, `sub_need`, `age_group`), or because the operator answered
a dynamically-injected question for it (`interview-match-preview.js`'s
`INPUTS` map, only used for keys with no interview/lead equivalent). A key in
neither place can never be resolved and would always show as missing — the
table below has none, because every field was checked against this before
shipping.

`need_domain` naming is **not** the same vocabulary as the `rt()` interview
topics in section 2 (e.g. `rt()`'s `school_child` vs `knowledge_routes`'
`school`; `rt()` has no `income_and_unemployment`/`family_finances` topic at
all — `needDomains()` pairs `family_finances` alongside `daycare` instead,
since the only two seeded `family_finances` routes are both child-related).
This is a known naming inconsistency between the two systems, not a bug —
`needDomains()` was written to bridge it, not to force one vocabulary onto
the other.

| Route | need_domain | Required input | Resolves via |
|---|---|---|---|
| `route.vantaa.kunnallinen-varhaiskasvatus` | daycare | `city` | lead's `city` |
| | | `child_age_or_birth_date` | dynamic question (no interview equivalent — daycare topic only asks the coarse `under7`/`over7` age bucket at intake) |
| | | `desired_start_date` | dynamic question |
| | | `care_need_schedule` | bridged from `care_schedule` (daycare topic, required) |
| | | `preferred_area` | dynamic question |
| `route.vantaa.private-varhaiskasvatus-palveluseteli` | daycare | `city` | lead's `city` |
| | | `permanent_vantaa_residence_context` | derived from lead `city` + `home_municipality` (daycare topic, required) |
| | | `child_age_or_birth_date` | dynamic question |
| | | `desired_start_date` | dynamic question |
| | | `care_need_schedule` | bridged from `care_schedule` |
| | | `preferred_provider_or_area` | dynamic question |
| | | `income_statement_status` | dynamic question |
| `route.finland.child-benefit` | family_finances | `child_age` | bridged from `child_age_or_birth_date` (itself a dynamic question) |
| | | `guardian_or_care_responsibility` | dynamic question |
| | | `finland_residence_or_employment_context` | dynamic question |
| `route.finland.child-home-care-allowance` | family_finances | `youngest_child_age` | dynamic question |
| | | `municipal_ece_status` | dynamic question |
| | | `same_child_parental_or_private_daycare_allowance` | dynamic question |
| | | `guardian_or_care_responsibility` | dynamic question |
| `route.vantaa.harrastusten-vantaa` | hobby | `city` | lead's `city` |
| | | `school_age_or_grade` | bridged from `grade` (hobby topic, required) |
| | | `school_or_area` | bridged from `school_name` (hobby topic, required) |
| | | `interest` | falls back to the lead's `sub_need` (the hobby category picked at intake) |
| | | `availability` | bridged from `days` (hobby topic, required) |
| `route.finland.general-social-security-benefit` | income_and_unemployment | `main_status` | dynamic question |
| | | `jobseeker_registration_status` | bridged from `jobseeker_active` (work topic, required) |
| | | `earnings_related_status` | dynamic question |
| | | `current_earned_income` | dynamic question |
| | | `other_income_context` | dynamic question |
| `route.vantaa.s2-ja-oppimisen-tuki` | school | `city` | lead's `city` |
| | | `child_age_or_grade` | bridged from `grade` (school_child topic, required) |
| | | `current_school_or_enrolment` | bridged from `school_route` (school_child topic, required) |
| | | `language_learning_concern` | bridged from `s2`, falling back to `child_finnish` (both school_child topic, required) |
| | | `support_need_description` | bridged from `school_goal` (school_child topic, required) |
| `route.finland.jobseeker-registration` | work | `work_status` | bridged from `main_status` if answered, else `jobseeker_active` |
| | | `planned_unemployment_date` | dynamic question |
| | | `jobseeker_registration_status` | bridged from `jobseeker_active` |
| | | `municipality` | lead's `city` |
| | | `right_to_work_known_when_relevant` | bridged from `right_to_work_known` (work topic, required) |

No route is currently seeded for `entrepreneurship`, `program`, or
`service_support` — those `rt()` interview topics collect real answers, but
`match_preview` will only ever return "No verified route is mapped to this
need yet" for them until a knowledge-base researcher adds one. That is
correct, honest behavior, not a bug: the system never fabricates a route.

## 5. Public question → official answer → source → intake/interview/route crosswalk

One row per verified route seeded today. "Public question" is the framing
used on the matching `/so` page where one exists (its own H1, in the
family's own words); "Interview question" names the first question in that
route's required-input chain that isn't already implied by the intake step
itself.

| Public question | Official answer (source) | Source | Intake field | Interview question | Criterion | Route |
|---|---|---|---|---|---|---|
| "Vantaa päiväkoti codsi ma u baahan tahay?" (`/so/vantaa-paivakoti`, `/so/paivakoti`) | Apply in Vasa; municipal, private and palveluseteli routes exist; fees follow the city's client-fee schedule | [Vantaa: Varhaiskasvatukseen hakeminen](https://www.vantaa.fi/fi/kasvatus-ja-koulutus/varhaiskasvatus/varhaiskasvatukseen-hakeminen) · [Vantaa: Varhaiskasvatuksen asiakasmaksut](https://www.vantaa.fi/fi/kasvatus-ja-koulutus/varhaiskasvatus/varhaiskasvatuksen-asiakasmaksut) | Carruur iyo skuul → Päiväkoti ama xannaano | care_goal, care_schedule, home_municipality (interview) + desired_start_date, preferred_area (dynamic) | Family seeks the Vantaa municipal route (`city`) | `route.vantaa.kunnallinen-varhaiskasvatus` |
| Same page, private/voucher framing | Private daycare via service voucher uses the same application, provider must be Vantaa-approved, family must be permanently Vantaa-resident | [Vantaa: Yksityisen varhaiskasvatuksen palveluseteli](https://www.vantaa.fi/fi/yksityisen-varhaiskasvatuksen-palveluseteli) | Carruur iyo skuul → Päiväkoti ama xannaano | care_schedule, home_municipality (interview) + preferred_provider_or_area, income_statement_status (dynamic) | Provider must be in Vantaa's approved voucher network | `route.vantaa.private-varhaiskasvatus-palveluseteli` |
| Implicit in the same daycare need — "what money can we get for a child" is not yet its own `/so` page | Child benefit is paid per child under 17 to the parent/guardian | [Kela: Child benefit](https://www.kela.fi/child-benefit) | Carruur iyo skuul (any subcategory) | guardian_or_care_responsibility, finland_residence_or_employment_context (dynamic) | Child is under 17 | `route.finland.child-benefit` |
| Same gap | Home care allowance requires the youngest child under 3, no municipal ECE place in use, no parental/private daycare allowance already paid for the same child | [Kela: Child home care allowance](https://www.kela.fi/child-home-care-allowance) | Carruur iyo skuul (any subcategory) | guardian_or_care_responsibility, youngest_child_age, municipal_ece_status, same_child_parental_or_private_daycare_allowance (all dynamic) | Youngest child is under 3 | `route.finland.child-home-care-allowance` |
| "Ilmahaaga hobby ama ciyaar bilaash ah ma u raadineysaa?" (`/so/harrastus-ilmainen`) | Harrastusten Vantaa offers free, low-threshold activities for comprehensive-school-age children during the school day; individual offerings stay live and must be rechecked | [Vantaa: Harrastusten Vantaa](https://www.vantaa.fi/fi/harrastusten-vantaa) | Carruur iyo skuul → Ciyaar ama harrastus (or Harrastus ama ciyaar under school_child) | grade, school_name, days (interview) | Child is school age; programme availability confirmed at match time | `route.vantaa.harrastusten-vantaa` |
| "Ma rabtaa inaad dib ugu noqoto dugsi?" (`/so/dib-ugu-noqo-dugsi`) | S2 (Finnish as a second language) is used instead of the mother-tongue syllabus when Finnish isn't at native level; exact arrangement is school-specific | [Vantaa: S2 example (Martinlaakson koulu)](https://www.vantaa.fi/fi/palveluhakemisto/toimipiste/martinlaakson-koulu) | Carruur iyo skuul → Skuulka iyo taageerada ilmaha | grade, school_route, s2 (interview) | City must be Vantaa; a school decision on support must exist or be pending | `route.vantaa.s2-ja-oppimisen-tuki` |
| "Shaqo la'aan tahay oo ma hubtid sida työnhakija loo noqdo?" (`/so/tyoton-tyonhakija`) | Jobseeker registration happens in Työmarkkinatori's Asiointi, and (per the policy effective 1 Sep 2026) a new jobseeker generally has 15 working days to complete and publish the jobseeker profile | [Työmarkkinatori: Ilmoittautuminen työnhakijaksi](https://tyomarkkinatori.fi/henkiloasiakkaat/tietoa-tyoelamasta/tyonhaku/ilmoittautuminen-tyonhakijaksi) | Shaqo → Shaqo raadis | jobseeker_active, right_to_work_known (interview) + planned_unemployment_date (dynamic) | Right to work known when relevant; authority decision required for benefit eligibility | `route.finland.jobseeker-registration` |
| Same need, "what do I get paid while I look" — not yet its own `/so` page | General social security benefit during unemployment has its own jobseeker/earnings-related conditions | [Kela: General social security benefit](https://www.kela.fi/unemployment-general-social-security-benefit) | Shaqo → Shaqo raadis | jobseeker_active (interview) + main_status, earnings_related_status, current_earned_income, other_income_context (dynamic) | Active jobseeker status must be confirmed | `route.finland.general-social-security-benefit` |

Two concrete content gaps this table makes visible: `/so` has no page framed
around child benefit or home-care allowance (`family_finances`), and none
around unemployment-period income support distinct from `/so/tyoton-
tyonhakija`'s jobseeker-registration framing. Both are candidates for new
`/so` pages, not a code change — flagging per `seo/CONTEXT.md`'s content-gap
process rather than adding pages here.

## How this was built

The interview field tables (section 3) were generated, not transcribed, to
avoid drift between this doc and the code: `tracker/interview-match.js`'s `F`
object is a plain JS literal (no DOM calls inside it), so it can be extracted
and required as a standalone module and walked programmatically. The intake
fields (section 1), routing (section 2), route-resolution table (section 4)
and crosswalk (section 5) were built by hand from `caawi/app.js`,
`family-leads-admin`'s `match_preview` action, and a live query of
`knowledge_routes`/`knowledge_criteria`/`knowledge_sources`. Re-running the
same extraction after a future change to `F` is the fastest way to keep
section 3 accurate; sections 4-5 need a fresh query against
`knowledge_routes` since they reflect whatever routes are seeded at the time.

