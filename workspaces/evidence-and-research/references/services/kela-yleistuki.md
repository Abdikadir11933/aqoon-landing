---
id: service.kela.yleistuki
record_type: service
name_fi: Yleistuki
authority_id: authority.kela
decision_maker: Kela
scope: national
routes: [work, unemployment, benefits]
status: current
valid_from: 2026-05-01
verification_state: verified
last_verified_at: 2026-08-27
volatility: high
recheck_policy: every-case
source_ids: [src.kela.yleistuki, src.kela.calculators]
matching_fields: [unemployment_status, jobseeker_status, work_income, other_income, other_benefits, living_arrangement]
authority_confirmation_required: [entitlement, final_amount, payment_start_date]
aqoon_role: [explain, navigate, help-prepare]
aqoon_must_not: [decide-eligibility, calculate-final-decision, guarantee-payment]
supersedes: [service.kela.tyomarkkinatuki, service.kela.peruspaivaraha]
---

# Yleistuki

Kela's current calculator and benefit pages state that yleistuki replaced labour market subsidy (`työmarkkinatuki`) and basic unemployment allowance (`peruspäiväraha`) on 1.5.2026.

Primary sources:
- https://laskurit.kela.fi/general-social-security-benefit-calculator
- https://www.kela.fi/laskurit

Safety: use the calculator only as an estimate. Kela decides entitlement and amount.
