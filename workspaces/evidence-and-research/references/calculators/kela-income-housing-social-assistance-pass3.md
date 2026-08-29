# Pass 3 Kela calculator records

Checked: 2026-08-29. Use only public test inputs during QA. Never enter real family data into research tests or store calculator inputs/results in GitHub.

Canonical calculator index: https://www.kela.fi/calculators

Kela states that calculator results are estimates based on the information entered. They are not Kela decisions and do not replace an application, supporting documents or a current entitlement review.

## calculator.kela.yleistuki

- Official URL: https://laskurit.kela.fi/general-social-security-benefit-calculator
- Related service: `service.kela.yleistuki`
- Source: `src.kela.yleistuki-benefit` plus current calculator page
- Result type: estimated Yleistuki amount only
- Inputs observed 2026-08-29 include: benefit start date; specified other/capital income; relevant care allowances/pension income; partner child-home-care-allowance circumstance; whether the person lives with parent(s) and related parent-income branch. Later steps can vary based on answers.
- Limitations: does not decide entitlement; does not replace jobseeker-status duties or Kela's application evidence; inputs and logic can change; a result must never be recorded as a promised payment.
- Recheck rule: every case / before operator use.

## calculator.kela.general-housing-allowance

- Official URL: https://laskurit.kela.fi/general-housing-allowance-calculator
- Related service: `service.kela.general-housing-allowance`
- Result type: estimated general housing allowance amount
- Inputs observed 2026-08-29 include: calculation start month; municipality; household adults and children; special large-space disability branch. Subsequent steps depend on the answers and include housing/income information relevant to the estimate.
- Critical route inputs outside a calculator shortcut: current household definition, housing tenure/costs, household income/assets, student/pension route status and current municipality-specific rules.
- Limitations: the calculator cannot be treated as Kela's determination of who belongs to a household, which housing costs are accepted, entitlement, retroactivity or final amount.
- Recheck rule: every case, especially after moves/income/status changes.

## calculator.kela.social-assistance

- Official URL: https://laskurit.kela.fi/social-assistance-calculator
- Related service: `service.kela.basic-social-assistance`
- Result type: estimated basic social assistance amount/possible need
- Inputs observed 2026-08-29 include: calculation month; partner/parents; numbers and ages of children including agreed visiting children; whether another adult shares the household. Later steps collect the financial/expense facts used by the estimate.
- Critical route inputs outside a calculator shortcut: primary benefits applied/pending, current income/assets, necessary expenses, housing-cost limits, supporting documents, jobseeker obligations where applicable and any Kela basic-amount reduction decision.
- Limitations: the estimator cannot decide entitlement, accepted expenses, basic-amount reduction or wellbeing-services-county supplementary/preventive assistance; it does not replace required bank statements/bills/supporting evidence.
- Recheck rule: every case.

## Operator calculator rule

1. First identify the correct service/route and missing facts.
2. Use the official calculator only if an estimate helps the person understand the route.
3. Label the output explicitly as an estimate.
4. Do not save a real person's calculator inputs/results in the public repository.
5. Return to the official application/change-report path and Kela decision.
6. Recheck the calculator URL and current rules before any family-facing use.