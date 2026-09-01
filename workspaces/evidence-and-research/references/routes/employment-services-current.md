---
id: route.employment.current
record_type: route
need: public employment services
scope: Finland
authority_ids: [authority.employment-area]
required_inputs: [municipality, jobseeker_status, jobsearch_start_date, employment_status, goal, authentication_or_nationality_barrier]
source_ids: [src.jobmarket.te24, src.jobmarket.jobseeker-registration, src.jobmarket.employment-plan, src.jobmarket.employment-reforms-2026, src.jobmarket.unemployment-consequences]
volatility: high
last_verified_at: 2026-09-01
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

The official 2026 guidance says the initial interview is arranged within ten working days from the start of job search, and job-search discussions continue at three-month intervals. It also says part-time jobseekers generally moved to the same four-job-opportunities-per-month obligation from 1 January 2026. The employment authority records a person's actual obligation and instructions in their plan; AQOON must read the person's own authority instruction rather than apply a generic number.

The current national consequences page describes a two-tier model: a first lapse can result in a seven-day unpaid period, while a repeat lapse within 12 months can suspend unemployment security until a six-week work requirement is met. This is a high-risk, fact-specific authority process. AQOON may explain the published sequence and urge immediate contact with the authority; it must not decide whether a lapse occurred, whether a reason is accepted or whether a consequence is avoided.

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