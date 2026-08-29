# Kela income, housing and basic social assistance — Pass 3 services

Checked: 2026-08-29. Scope: national Kela services. These records support navigation only; Kela makes entitlement and payment decisions.

## service.kela.yleistuki — Pass 3 review linkage

Canonical service already exists at `services/kela-yleistuki.md`. Pass 3 does not silently replace it.

Current operational sources: `src.kela.yleistuki-benefit`, `src.finlex.yleistuki-act`, `src.kela.yleistuki-housing-combined-form-2026`.

Review required: the older source ID `src.kela.yleistuki` currently points to the calculator rather than the benefit page. Keep the existing record until human reconciliation.

AQOON may explain the current route, help gather facts, help prepare an application/change report and point to OmaKela. AQOON must not decide entitlement, promise an amount/start date, or infer a Kela decision from an estimator.

## service.kela.general-housing-allowance

---
id: service.kela.general-housing-allowance
record_type: service
name_fi: Yleinen asumistuki
authority_id: authority.kela
decision_maker: Kela
scope: national
status: current
verification_state: verified
last_verified_at: 2026-08-29
volatility: high
recheck_policy: every-case
source_ids: [src.kela.general-housing-allowance, src.kela.housing-income-assets, src.finlex.general-housing-allowance-act]
matching_fields: [household_members, municipality, housing_tenure, housing_costs, household_income, household_assets, student_status, pension_status, move_date]
authority_confirmation_required: [entitlement, accepted_housing_costs, final_amount, payment_start_date]
aqoon_role: [explain, navigate, compare-official-routes, help-prepare, remind-change-report]
aqoon_must_not: [decide-eligibility, promise-amount, promise-retroactive-payment, treat-calculator-as-decision]
---

General housing allowance is assessed for the household. Kela’s current guidance says household income and assets, housing costs, municipality and household composition can affect the result. Students and pensioners can fall under different housing-support routes, so those statuses are route-changing facts rather than assumptions.

## service.kela.basic-social-assistance

---
id: service.kela.basic-social-assistance
record_type: service
name_fi: Perustoimeentulotuki
authority_id: authority.kela
decision_maker: Kela
scope: national
status: current
verification_state: verified
last_verified_at: 2026-08-29
volatility: high
recheck_policy: every-case
source_ids: [src.kela.social-assistance, src.kela.social-assistance-expenses, src.kela.social-assistance-basic-amount, src.kela.social-assistance-how-to-apply, src.kela.social-assistance-changes, src.finlex.social-assistance-act]
matching_fields: [family_unit, income, assets, primary_benefits_status, jobseeker_status_if_applicable, housing_costs, other_necessary_expenses, supporting_documents, urgent_need]
authority_confirmation_required: [entitlement, accepted_expenses, reduction_of_basic_amount, final_amount, decision_period]
aqoon_role: [explain, navigate, help-prepare, document-checklist, remind-change-report, refer-officially]
aqoon_must_not: [decide-eligibility, promise-amount, decide-basic-amount-reduction, decide-expense-acceptance, replace-kela-or-wellbeing-services-county]
---

Basic social assistance is a last-resort Kela benefit. Operators must first establish whether primary benefits have been applied for or are pending, and must not interpret a person’s income, assets, job-search situation or expenses as an approval decision. Supplementary or preventive social assistance and social-work needs belong to the relevant wellbeing-services-county route and are outside this Pass 3 service record.