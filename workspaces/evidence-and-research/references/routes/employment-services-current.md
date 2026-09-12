---
id: route.employment.current
record_type: route
need: public employment services
scope: Finland
authority_ids: [authority.employment-area]
required_inputs: [municipality, jobseeker_status, jobsearch_start_date, employment_status, goal, authentication_or_nationality_barrier]
source_ids: [src.jobmarket.te24, src.jobmarket.jobseeker-registration, src.jobmarket.employment-plan, src.jobmarket.employment-reforms-2026, src.jobmarket.unemployment-consequences]
volatility: high
last_verified_at: 2026-09-12
decision_maker: user's municipal employment area / relevant provider
aqoon_role: [explain, navigate, help_prepare, remind]
aqoon_must_not: [register_user, decide_unemployment_security, create_authority_plan, determine_statutory_obligations]
---

# Current employment-services route

All TE offices ended operations on 31.12.2024 and public employment services transferred to municipal employment areas on 1.1.2025. Job Market Finland / Työmarkkinatori remains the national digital service, including e-services.

Primary source for the 2025 transfer: https://tyomarkkinatori.fi/en/news/uudenmaan-te-toimisto-lakkautetaan-ja-tyonhakijoiden-palvelut-siirtyvat-tyollisyysalueille-1.1.2025

Terminology: use `työllisyyspalvelut` / employment area as the current default. Use `TE-toimisto` only as a legacy explanation when a user knows the old term.

## Active jobseeker entry

Someone who is becoming unemployed or laid off can register through Työmarkkinatori's Asiointi service before the change, and should do so no later than their first unemployment day if they intend to seek unemployment security. The person needs to use their own authentication; where the official service says online authentication or nationality conditions prevent that, the local employment-services office is the official alternative. Registration does **not** establish a right to a benefit: the employment authority's statement and the paying institution's own decision remain separate.

After registration, the authority agrees how the customer's case will proceed. The person can see agreed tasks, messages, requests for clarification and employment-plan items in their own Asiointi account. AQOON can help the person understand an official instruction, prepare for the first discussion and set reminders. It must never register on their behalf, guess a deadline that is not visible in the authority's instruction, or represent a benefit decision as confirmed.

## Proof of active job search from 8.9.2026

From 8 September 2026, a jobseeker who needs to prove that their job search is valid can obtain a certificate directly from Työmarkkinatori's Asiointi service. The official route is `Asiointitiedot` → `Tulosteet ja todistukset` → `Lataa todistus (PDF)`. The person can alternatively open the certificate in Asiointi on a mobile device and show it from the screen.

This is evidence of **job-search validity**. It is not by itself a decision that the person is entitled to unemployment benefit; labour-policy assessment and the benefit payer's decision remain separate. AQOON can help a client find and show/download the certificate when another service asks for proof, but must not turn the certificate into a benefit-eligibility promise.

Primary source: https://tyomarkkinatori.fi/ohjeet-ja-tuki/henkiloasiakkaat/asiointi-osion-ohjeet/todistus-tyonhaun-voimassaolosta

## 2026 interview, search and consequence context

The official 2026 guidance says the initial interview is arranged within ten working days from the start of job search. Regular `työnhakukeskustelu` meetings remain part of the service process, while supplementary job-search discussions are arranged according to the person's service need rather than as an automatic fixed extra cadence. The employment authority records the person's actual obligation, meetings and instructions in their plan; AQOON must read the person's own authority instruction rather than apply a generic number.

From 1 January 2026, part-time jobseekers are generally subject to the job-search obligation as well; the current official summary says part-time workers generally have to apply for four job opportunities per month unless the authority reduces or removes the obligation under the statutory rules. A vacancy specifically indicated by the employment authority is more binding than an ordinary self-chosen application: when the authority directs the person to a suitable vacancy, applying for the number of jobs already recorded in the plan or merely publishing a Työnhakuprofiili does not replace the obligation to apply for that indicated job. AQOON must therefore ask what the person's own plan and Asiointi tasks actually require rather than assume that part-time work, an already-met monthly count or a published profile means there are no remaining tasks.

The 1 March 2026 changes also mean that two separate consequences must not be collapsed into one. The **validity of job search can end after the first failure to deal with the employment authority in the required way and by the stated deadline**. Separately, the current unemployment-security consequence model says a first qualifying lapse can lead to a seven-day unpaid period, while a second or later lapse within 12 months can lead to a six-week work requirement. These are high-risk, fact-specific authority processes. AQOON may explain the published sequence, check whether job search still shows as active in Asiointi and urge immediate contact with the authority; it must not decide whether a lapse occurred, whether a reason is accepted, whether job search must be reactivated or whether a benefit consequence applies.

Primary source: https://tyomarkkinatori.fi/en/news/tyollisyyspalveluja_koskevat_lakiuudistukset_vuonna_2026_

## Under-25 education application obligation — 2026 checkpoint

A jobseeker under 25 who does not have vocational education after comprehensive school or upper-secondary school is subject to special unemployment-security education-application rules. The current official guidance says the person generally has to apply for at least two suitable study places leading to vocational competence for education starting the following autumn. Depending on the person's background and what is agreed in the employment plan, qualifying routes can also include specified alternatives such as a qualification unit, TUVA, jointly procured labour-market training, immigrant preparatory higher-education studies, or another agreed route when health, learning difficulties or language prevent ordinary applications.

For the 2026 autumn intake, the published deadline was 31 August 2026. If the person was still an unemployed jobseeker on 1 September, the employment authority can ask where they applied. Failure to apply, deliberately causing non-selection, refusing a place or failing to start can affect unemployment security when there is no accepted reason. AQOON must **not** decide that support has been lost: the authority evaluates the labour-policy condition and Kela or the unemployment fund decides payment.

Operator implication from September 2026: for a jobseeker under 25, ask whether they have a vocational or higher-education qualification, what education they applied to before 31.8., whether an alternative application route was agreed in their employment plan, whether they received or refused a place, and whether a new message/clarification request is visible in Asiointi. If anything is unclear, route the case back to the employment authority rather than inventing a consequence.

Primary sources:
- Job Market Finland, under-25 unemployment security: https://tyomarkkinatori.fi/henkiloasiakkaat/tietoa-tyoelamasta/tyottomyysturva/alle-25-vuotiaan-tyottomyysturva
- Job Market Finland, 2026 application deadline/context: https://tyomarkkinatori.fi/uutiset/yhteishaku-2026-ja-koulutushaun-vaikutukset-tyottomyysturvaan

## Open higher-education studies from 1.7.2026

For a jobseeker who is **25 or older**, covered open higher-education studies that start on or after 1 July 2026 at an open university, open university of applied sciences, adult education centre (`kansalaisopisto`) or summer university do not affect the right to unemployment security under the published rule. The person does not need to report those covered studies to the employment authority for an unemployment-security assessment.

The change does **not** remove normal job-search duties. The person must still apply for work as agreed in the employment plan, remain ready to accept full-time work and participate in agreed employment-promoting services. Jobseekers under 25 must still report open higher-education studies and their effect is assessed. Other studies outside this rule must also still be reported and assessed. Helsinki's current guidance additionally warns that open higher-education studies provided by a `kansanopisto` are not covered by this exception.

Open higher-education studies can no longer be separately agreed as unemployment-benefit-supported independent studies under this route; that change also applies to people under 25.

Primary sources:
- Job Market Finland: https://tyomarkkinatori.fi/uutiset/avoimet-korkeakouluopinnot-eivat-jatkossa-vaikuta-25-vuotta-tayttaneiden-tyottomyysturvaan1
- City of Helsinki clarification: https://www.hel.fi/fi/uutiset/tyottomana-voi-nyt-opiskella-avoimia-korkeakouluopintoja-menettamatta-tyottomyysetuutta

Operator implication: when a jobseeker says they are studying, do not automatically treat study as incompatible with unemployment security. Ask the person's age, what kind of studies they are, the provider, when the studies started and whether job search is still active. Apply the 25+ open-higher-education rule only when the published conditions fit; otherwise route the case for the authority's study/unemployment-security assessment.

## Työnhakuprofiili from 1.9.2026

From 1 September 2026, creating, publishing and keeping a Työnhakuprofiili published is generally part of the jobseeker's obligations when the statutory requirement applies.

- New jobseeker: generally 15 working days after job search starts to complete and publish the profile.
- Job search started before 1.9.2026: the obligation or an applicable exemption is set at the next `työnhakukeskustelu` or when the person's plan is prepared. Current official guidance says that when the next job-search discussion triggers the obligation, there are generally 15 working days after that discussion to complete and publish the profile. Check the person's own plan/instruction for the actual deadline.
- A published profile is valid for a maximum of six months at a time. If job search continues, it must be republished so that it remains published throughout the job search when the obligation applies. Job Market Finland provides a “Continue publishing for 6 months” renewal action.
- Statutory exceptions exist, including examples such as full-time work, full-time study or entrepreneurship, or when the employment authority assesses that the person cannot independently use the profile in job search.
- If the person does not publish within the required time, the employment authority can publish minimum profile information. Current official guidance says the profile-publication issue itself does not end job search or directly affect unemployment security.

Primary sources:
- Job Market Finland, September obligation: https://tyomarkkinatori.fi/uutiset/tyonhakuprofiili-tulee-osaksi-tyonhakua-1-9-alkaen
- Job Market Finland, current profile instructions and six-month renewal: https://tyomarkkinatori.fi/en/instructions-and-support/personal-customers/instructions-for-the-my-job-path-section/independent-job-search/how-to-fill-in-your-job-applicant-profile

Operator implication: from September onward, when work is relevant, ask whether job search is active, when it started, whether a post-1.9 `työnhakukeskustelu` or plan preparation has happened for an older job search, whether Työnhakuprofiili is published, when the current publication expires/was last republished, and what deadline/instruction appears in the person's own Työmarkkinatori account. Do not frame the profile as only an optional CV tip, and do not incorrectly threaten loss of benefit or job-search status.

## Local recruitment subsidies for young and foreign-language jobseekers — 2026

Several municipal employment areas currently have employer-paid recruitment subsidies that can be a useful hiring lever for an eligible jobseeker. These are **local, discretionary employer subsidies**, not benefits paid to the jobseeker, and they do not replace the ordinary job-search or unemployment-security rules.

- **Helsinki Nuorten rekrytointituki:** for an unemployed Helsinki jobseeker under 30. Current city guidance says an employer can receive 50% of wage costs, up to EUR 1,500/month, for 3–6 months. The jobseeker can tell a prospective employer about the route, but the employer makes the application/agreement with Helsinki Employment Services before the employment begins. The temporary scheme can currently be applied for through 31.5.2027 and granted through 30.6.2027.
- **Espoo/Kauniainen Nuorten rekrytointituki:** current terms from 1.7.2026 cover an unemployed Espoo or Kauniainen jobseeker under 30. The private- or third-sector employer can receive 50% of wage costs, up to EUR 1,500/month, for 3–6 months. The employment can be part-time or full-time and fixed-term or permanent; the employer must secure the support before the employment begins.
- **Vantaa Nuorten rekrytointituki:** current Vantaa guidance covers an unemployed 18–29-year-old Vantaa jobseeker. A private- or third-sector employer can receive 50% of gross wage costs, up to EUR 1,500/month, for 3–6 months, including part-time or full-time work. Vantaa instructs the young person to contact their responsible employment-services official as part of the employer's application process, and the employment must not start before the support agreement.
- **Espoon rekrytointituki:** separate from the youth subsidy. Espoo can pay a private- or third-sector employer a discretionary EUR 5,000 one-off subsidy for hiring an unemployed Espoo resident who is **under 30 or foreign-language**, has been unemployed for at least three months and has upper-secondary or higher education. The employment must last at least 12 months at at least 80% working time and cannot start before the subsidy is granted.

Primary sources:
- Helsinki, jobseeker-facing youth subsidy: https://www.hel.fi/en/business-and-work/jobseekers/start-your-job-search/recruitment-subsidy-for-young-people
- Espoo, youth subsidy: https://www.espoo.fi/fi/nuorten-rekrytointituki
- Vantaa, youth recruitment support: https://www.vantaa.fi/fi/tyonhaku-ja-tyollistaminen/tyonantajapalvelut/rekrytoinnin-tuet-ja-etuudet/nuorten-tyontekijoiden-rekrytoinnin-tuet
- Espoo, EUR 5,000 recruitment subsidy: https://www.espoo.fi/en/rekrytointituki

Operator implication: when a young unemployed client in Helsinki/Espoo/Vantaa, or a foreign-language unemployed Espoo client, is actively talking to an employer, ask municipality, age, current unemployment status/duration, education, employer type, proposed contract length/hours and whether work has already started. Explain that the employer—not the jobseeker—applies for and receives the support. Never tell a family or employer that the subsidy is guaranteed; route them to the relevant local employment service before the start date.

## Espoo service-access change from 1.9.2026

Espoo changed its walk-in employment-service access on 1 September 2026. For urgent official job-search matters without an appointment, the current published hours are:

- Sello office: Monday-Friday 9.00-15.00.
- Piispanportti office: Monday and Friday 9.00-15.00 only.
- Iso Omena Information Point: Wednesday 9.00-12.00 and 13.00-16.00. This is general low-threshold advice and does **not** handle official matters.
- Separate job-search guidance at Sello and Piispanportti remains Monday-Friday 9.00-16.00 and is open to everyone, but it also does not handle official matters.

Primary source: https://www.espoo.fi/en/news/2026/08/changes-opening-hours-jobseekers-advisory-services-1-september-2026

Operator implication: distinguish an **official job-search matter** (for example registration, submitting documents or signing a plan) from general job-search guidance before sending an Espoo client to a service point. Re-check the City of Espoo page before giving same-day opening-hour advice because local hours are operational and can change.