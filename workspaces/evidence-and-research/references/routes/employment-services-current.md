---
id: route.employment.current
record_type: route
need: public employment services
scope: Finland
authority_ids: [authority.employment-area]
required_inputs: [municipality, jobseeker_status, jobsearch_start_date, employment_status, goal, authentication_or_nationality_barrier]
source_ids: [src.jobmarket.te24, src.jobmarket.jobseeker-registration, src.jobmarket.employment-plan, src.jobmarket.employment-reforms-2026, src.jobmarket.unemployment-consequences]
volatility: high
last_verified_at: 2026-09-02
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

## 2026 interview, search and consequence context

The official 2026 guidance says the initial interview is arranged within ten working days from the start of job search. Regular `työnhakukeskustelu` meetings remain part of the service process, while supplementary job-search discussions are arranged according to the person's service need rather than as an automatic fixed extra cadence. The employment authority records the person's actual obligation, meetings and instructions in their plan; AQOON must read the person's own authority instruction rather than apply a generic number.

The 1 March 2026 changes also mean that two separate consequences must not be collapsed into one. The **validity of job search can end after the first failure to deal with the employment authority in the required way and by the stated deadline**. Separately, the current unemployment-security consequence model says a first qualifying lapse can lead to a seven-day unpaid period, while a second or later lapse within 12 months can lead to a six-week work requirement. These are high-risk, fact-specific authority processes. AQOON may explain the published sequence, check whether job search still shows as active in Asiointi and urge immediate contact with the authority; it must not decide whether a lapse occurred, whether a reason is accepted, whether job search must be reactivated or whether a benefit consequence applies.

Primary source: https://tyomarkkinatori.fi/uutiset/tyollisyyspalveluja_koskevat_lakiuudistukset_vuonna_2026_

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
- Job search started before 1.9.2026: the obligation normally starts at the next `työnhakukeskustelu`; after that discussion there are generally 15 working days to complete and publish it.
- Statutory exceptions exist, including examples such as full-time work, full-time study or entrepreneurship, or when the employment authority assesses that the person cannot independently use the profile in job search.
- If the person does not publish within the required time, the employment authority can publish minimum profile information. Current official guidance says the profile-publication issue itself does not end job search or directly affect unemployment security.

Primary source: https://tyomarkkinatori.fi/uutiset/tyonhakuprofiilin-julkaisemista-koskeva-lakimuutos-astuu-voimaan-syyskuun-alusta

Operator implication: from September onward, when work is relevant, ask whether job search is active, when it started, whether a post-1.9 `työnhakukeskustelu` has happened for an older job search, whether Työnhakuprofiili is published, and what deadline/instruction appears in the person's own Työmarkkinatori account. Do not frame the profile as only an optional CV tip, and do not incorrectly threaten loss of benefit or job-search status.

## Espoo service-access change from 1.9.2026

Espoo changed its walk-in employment-service access on 1 September 2026. For urgent official job-search matters without an appointment, the current published hours are:

- Sello office: Monday-Friday 9.00-15.00.
- Piispanportti office: Monday and Friday 9.00-15.00 only.
- Iso Omena Information Point: Wednesday 9.00-12.00 and 13.00-16.00. This is general low-threshold advice and does **not** handle official matters.
- Separate job-search guidance at Sello and Piispanportti remains Monday-Friday 9.00-16.00 and is open to everyone, but it also does not handle official matters.

Primary source: https://www.espoo.fi/en/news/2026/08/changes-opening-hours-jobseekers-advisory-services-1-september-2026

Operator implication: distinguish an **official job-search matter** (for example registration, submitting documents or signing a plan) from general job-search guidance before sending an Espoo client to a service point. Re-check the City of Espoo page before giving same-day opening-hour advice because local hours are operational and can change.
