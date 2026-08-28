# Finland navigation research atlas

Status: AQOON's master research map. This is an index and research-control document, not a source of legal or benefit decisions.

## Why this exists

AQOON needs a complete map of Finnish life-navigation questions without turning the repository into a flat pile of links or letting an agent invent a route. This atlas assigns every domain a canonical research home, the family facts that matter, the authority that decides, the required source type, and the freshness standard.

The operator brain assembles guidance in this order:

`family goal + minimal facts -> verified route candidates -> AQOON policy packs -> human explanation/next action -> authority/provider decision -> measured outcome`

## Research record hierarchy

1. **Source record** — an exact official/provider URL with source ID, scope, volatility, checked date and replacement link.
2. **Service record** — a durable description of one service and its decision-maker.
3. **Route record** — the facts, criteria, authority-confirmation points and practical steps for a specific path.
4. **Live programme candidate** — a time-bound opportunity awaiting current verification; never permanent knowledge by itself.
5. **PII-free learning record** — a confirmed observed pattern that can improve questions/follow-up but cannot override an official rule.

Canonical folders remain `workspaces/evidence-and-research/references/{sources,authorities,services,routes,calculators,current}`. The protected database mirrors approved records for Tracker matching; GitHub never holds family cases.

## Research domains

| Domain | Typical family goal | Route-critical facts | Primary decision-maker/source class | Freshness |
| --- | --- | --- | --- | --- |
| Arrival, residence and identity | settle, renew status, family reunion, citizenship | residence basis/status, family situation, dates, municipality | Migri, DVV, Finlex | high |
| Integration and plans | language, orientation, integration support | municipality, age, unemployment/jobseeker status, plan history, goal | employment authority, municipality, Finlex | high |
| Work and unemployment | register, keep job search valid, training, work trial, job | employment status, job-search dates/status, work/study/enterprise status, availability, childcare | Työmarkkinatori, employment area, Kela | high/live |
| Education and qualification | Finnish, YKI, vocational/higher education, recognition | age, prior education, language, current study/jobseeker status, goal | OPH, Studyinfo, provider, employment authority | high/live |
| Income and benefits | understand support/application/calculator | household, income, housing, children, work/study status, residence facts where relevant | Kela, wellbeing services county, municipality | high/live |
| Pregnancy, children and early childhood | benefits, daycare, preschool, private/municipal options | municipality, child age/DOB, care need/date, household/care status, provider preference | Kela, municipality, provider | high/live |
| School-age children | school place, S2, support, free hobby | municipality, grade/age, school, language/support need, timetable | municipality, school, OPH, provider | medium/high |
| Health, disability and social support | find the right assessment/service | wellbeing-services county, need/urgency, existing care, age | wellbeing services county, Kela, Omaolo | high |
| Housing, debt and consumer matters | housing application, rent/benefit, debt advice | municipality, household, income, tenure, urgency | municipality, Kela, financial/debt advice | high |
| Entrepreneurship | start business, training, social-security questions | current jobseeker status, business activity, work hours, municipality, goal | employment authority, Vero, PRH, Kela | high |
| Older people and carers | home services, carer support, pensions, transport | municipality/county, age, health/functional need, family-carer situation | wellbeing services county, Kela, municipality | high |

## Required research questions for every route

1. What exact problem does this route solve?
2. Who decides or provides it?
3. Which facts must be known before AQOON can call it possible?
4. What exclusions or authority-confirmation points exist?
5. Which official page/calculator/application starts the process?
6. What can AQOON explain, prepare or remind—and what must AQOON never promise?
7. Which consent or commercial-disclosure rule applies?
8. How quickly can the rule/programme change, and when is it rechecked?
9. What evidence would count as assisted action, verified outcome and persistence?

## First research tranche: integration to work/study

This tranche is deliberately decomposed, because "get back to work" can mean several different routes:

| Record group | Must distinguish |
| --- | --- |
| Jobseeker registration | first unemployment day, authentication/alternative registration, active status, municipal employment area |
| Plans | employment plan, integration plan, activation/multidisciplinary variants; who prepares it; duties; review points |
| Integration services | initial assessment, integration training, language/literacy, municipality/employment-authority responsibilities |
| Study while unemployed | labour-market training, self-motivated study, prerequisite discussion with employment services before starting |
| Work-entry support | job-search/career coaching, work trial, wage subsidy, apprenticeship; each has its own authority/provider decision |
| Education/qualification | Studyinfo, YKI, recognition/bridging where applicable; current application windows are live candidates |
| Status-sensitive routes | document the exact condition from Migri/authority, never infer from nationality or time in Finland alone |

## Review queues

The future database queue uses four separate queues so a changed link cannot silently become advice:

- **Discovery**: possible source/programme found; no family-facing claim.
- **Verification**: official page read; comparison against current approved record required.
- **Policy review**: AQOON communication/consent/disclosure rule changed; affected routes identified.
- **Outcome learning**: anonymised confirmed case pattern needs a human to decide whether it improves a question, a step or neither.

## Completion definition

A domain is not "complete" when it has many links. It is complete only when its high-volume/high-risk routes have source-bound service and route records, required fact sets, recheck rules, operator language, and a testable outcome definition. All other items remain explicitly queued rather than implicitly assumed.
