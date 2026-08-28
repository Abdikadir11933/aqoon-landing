---
id: route.employment.current
record_type: route
need: public employment services
scope: Finland
authority_ids: [authority.employment-area]
required_inputs: [municipality, jobseeker_status, employment_status, goal]
source_ids: [src.jobmarket.te24]
volatility: medium
last_verified_at: 2026-08-28
decision_maker: user's municipal employment area / relevant provider
---

# Current employment-services route

All TE offices ended operations on 31.12.2024 and public employment services transferred to municipal employment areas on 1.1.2025. Job Market Finland / Työmarkkinatori remains the national digital service, including e-services.

Primary source for the 2025 transfer: https://tyomarkkinatori.fi/en/news/uudenmaan-te-toimisto-lakkautetaan-ja-tyonhakijoiden-palvelut-siirtyvat-tyollisyysalueille-1.1.2025

Terminology: use `työllisyyspalvelut` / employment area as the current default. Use `TE-toimisto` only as a legacy explanation when a user knows the old term.

## Työnhakuprofiili from 1.9.2026

From 1 September 2026, creating, publishing and keeping a Työnhakuprofiili published is generally part of the jobseeker's obligations when the statutory requirement applies.

- New jobseeker: generally 15 working days after job search starts to complete and publish the profile.
- Job search started before 1.9.2026: the obligation normally starts at the next `työnhakukeskustelu`; after that discussion there are generally 15 working days to complete and publish it.
- Statutory exceptions exist, including examples such as full-time work, full-time study or entrepreneurship, or when the employment authority assesses that the person cannot independently use the profile in job search.
- If the person does not publish within the required time, the employment authority can publish minimum profile information. Current official guidance says the profile-publication issue itself does not end job search or directly affect unemployment security.

Primary source: https://tyomarkkinatori.fi/uutiset/tyonhakuprofiilin-julkaisemista-koskeva-lakimuutos-astuu-voimaan-syyskuun-alusta

Operator implication: from September onward, when work is relevant, ask whether job search is active, when it started, whether a post-1.9 `työnhakukeskustelu` has happened for an older job search, whether Työnhakuprofiili is published, and what deadline/instruction appears in the person's own Työmarkkinatori account. Do not frame the profile as only an optional CV tip, and do not incorrectly threaten loss of benefit or job-search status.
