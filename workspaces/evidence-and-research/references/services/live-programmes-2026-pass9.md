# Live national programmes — Pass 9 services

Checked: 2026-08-29. Scope: national Finland only. These records describe live, time-bound public programmes and grant rounds, not standing entitlements. Every `recheck_policy` here is `every-case` regardless of what is written below, because application windows, budgets and eligible-project lists change on a schedule these records do not track in real time.

## service.tem.nuorten-tyollistymisseteli

---
id: service.tem.nuorten-tyollistymisseteli
record_type: service
name_fi: Nuorten työllistymisseteli
authority_id: authority.tem
decision_maker: TEM / TE-palvelut / employer
scope: national
status: live-programme
verification_state: verified
last_verified_at: 2026-08-29
volatility: high
recheck_policy: every-case
source_ids: [src.tem.nuorten-tyollistymisseteli]
matching_fields: [applicant_age, jobseeker_status, employer_interest]
authority_confirmation_required: [voucher_eligibility, voucher_amount, application_window, employer_terms]
aqoon_role: [explain, link-official-page, direct-to-te-services]
aqoon_must_not: [promise-a-job, promise-voucher-approval, state-exact-remaining-application-time]
---

Employers can use a recruitment voucher to hire an unemployed 18–29-year-old, under a decree effective 22.12.2025 with applications opened 23.12.2025. This is an employer-facing incentive; a young jobseeker's own next step is normal TE-services registration and asking whether an employer they are talking to can use the voucher. AQOON must not tell a young person the voucher guarantees them a job.

## service.okm.suomi-liikkeelle

---
id: service.okm.suomi-liikkeelle
record_type: service
name_fi: Suomi liikkeelle -ohjelma
authority_id: authority.okm
decision_maker: OKM / grant-receiving organisations
scope: national
status: live-programme
verification_state: verified
last_verified_at: 2026-05-25
volatility: high
recheck_policy: every-case
source_ids: [src.okm.suomi-liikkeelle-rahoitus-2026]
matching_fields: [child_or_family_interest_in_movement, municipality, organisation_contact]
authority_confirmation_required: [which_local_project_is_open, application_window, target_group_per_project]
aqoon_role: [explain-programme-exists, point-to-okm-page, ask-about-local-daycare-or-organisation-projects]
aqoon_must_not: [promise-a-funded-place, promise-a-specific-euro-amount-to-a-family, name-a-local-project-without-checking-it-is-still-open]
---

A national physical-activity programme (~EUR 20 million/year, ~EUR 80 million across the government term) funds movement projects; EUR 17 million is allocated in 2026, including early-childhood-education movement and organisation-run trials. This is programme-level, not a direct family benefit: a family's real access depends on whether their daycare, school or a local organisation is running a funded project, which must be checked locally and cannot be asserted from this record alone.

## service.stea.avustukset-2026

---
id: service.stea.avustukset-2026
record_type: service
name_fi: STEA:n vuoden 2026 avustukset
authority_id: authority.stea
decision_maker: STEA / STM
scope: national
status: live-programme
verification_state: verified
last_verified_at: 2026-08-29
volatility: high
recheck_policy: every-case
source_ids: [src.stea.avustusehdotus-2026, src.stm.jarjestoavustukset-2026]
matching_fields: [organisation_type, project_type, eu_cofinancing_need]
authority_confirmation_required: [final_decision_amount, which_projects_are_funded, application_round_dates]
aqoon_role: [explain-that-total-funding-exists, clarify-that-new-project-funding-is-limited, direct-organisations-to-stea]
aqoon_must_not: [promise-a-grant-to-a-specific-organisation, treat-the-proposal-figure-as-a-final-decision]
---

STM's 2026 proposal recommends about EUR 274 million in STEA grants (about EUR 30 million less than the previous year). New project funding is limited to EU-project co-financing (EUR 1.52 million) and youth drug-harm-prevention projects (EUR 1.0 million); most of the total supports existing, already-funded organisation activity. AQOON must not present this as new money broadly available to new applicants.

## service.stea.nuorten-huumehankkeet-2026

---
id: service.stea.nuorten-huumehankkeet-2026
record_type: service
name_fi: Nuorten huumekuolemia ehkäisevät hankkeet
authority_id: authority.stea
decision_maker: STEA / STM / THL
scope: national (Helsinki, Oulu and one national project)
status: live-programme
verification_state: verified
last_verified_at: 2025-12-10
volatility: high
recheck_policy: every-case
source_ids: [src.stea.nuorten-huumehankkeet-2026]
matching_fields: [youth_drug_risk_concern, family_location]
authority_confirmation_required: [project_names, intake_criteria, referral_route]
aqoon_role: [mention-that-prevention-projects-exist, direct-to-stea-thl-for-current-contact-details]
aqoon_must_not: [claim-a-project-will-accept-a-specific-young-person, promise-treatment-or-outcome]
---

EUR 1.0 million funds three youth drug-harm-prevention projects (Helsinki, Oulu, one national project) for 2026–2028. Exact intake criteria and referral routes are not yet extracted — this record supports "such prevention projects exist and are STM/STEA/THL-funded," not a working referral path. Treat any specific project as `verification_pending` until its own intake page or contact is confirmed.

## service.stm.eu-rakennerahastot-2021-2027

---
id: service.stm.eu-rakennerahastot-2021-2027
record_type: service
name_fi: EU:n alue- ja rakennepolitiikan ohjelma 2021–2027
authority_id: authority.stm
decision_maker: ELY-keskukset / hankkeen toteuttaja
scope: national, ELY-centre-coordinated
status: live-programme
verification_state: verified
last_verified_at: 2026-08-29
volatility: medium
recheck_policy: every-case
source_ids: [src.stm.eu-rakennerahastot-2021-2027]
matching_fields: [organisation_or_family_goal, region]
authority_confirmation_required: [open_call_status, regional_ely_contact, eligible_applicant_type]
aqoon_role: [explain-programme-structure, point-to-eura2021-and-ely-centre]
aqoon_must_not: [claim-a-specific-open-call-exists-without-checking-eura2021]
---

Finland runs the EU ESR+/EAKR structural-funds programme 2021–2027 ("Uudistuva ja osaava Suomi"); STM participates in employment, social-innovation and poverty-reduction priority lines, coordinated regionally through ELY centres. This is a funding-structure record only; whether any given call is currently open must be checked in EURA2021 and with the relevant regional ELY centre, never asserted here.
