---
id: route.study-work-entry.current
record_type: route
need: choose a safe route toward study, work practice or return to work while jobseeking
scope: Finland; resolve local employment authority before referral
authority_ids: [authority.employment-area, authority.kela]
decision_maker: municipal employment authority for plan/service route; Kela or unemployment fund for benefit payment
required_inputs: [municipality, active_jobseeker_status, existing_plan_status, study_or_work_goal, course_or_employer_details_if_known, study_start_date, integration_plan_status, age, work_ability_context]
source_ids: [src.jobmarket.work-trial, src.jobmarket.self-motivated-study, src.jobmarket.immigrant-self-motivated-study, src.jobmarket.labour-market-training, src.jobmarket.wage-subsidy, src.kela.yleistuki-benefit]
verification_state: verified
last_verified_at: 2026-08-29
volatility: high
recheck_policy: every-case
aqoon_role: [explain, navigate, help_prepare, remind]
aqoon_must_not: [tell_user_to_enrol_before_authority_check, decide_benefit_continuation, secure_place_or_employer, promise_wage_subsidy, submit_user_declaration]
---

# Study and work-entry — current route

## First safety question

Is the person an active jobseeker, and have they told their employment-services expert about the planned study or work route? If not, do not promise that unemployment security continues. Help them contact the authority before the start date.

## Route selector

- Wants a course selected by public employment services: ask about labour-market training or integration training through the employment authority.
- Has found a course themselves: ask about self-motivated study while unemployed; give the authority the study title, provider, start date, duration, intensity and employment goal.
- Uses an integration plan and wants full-time study: ask the authority whether immigrant customer's self-motivated study is appropriate and can be agreed in the plan.
- Needs to test an occupation or re-enter work gradually: ask about a work trial; it is not an employment contract.
- Has a potential employer or apprenticeship employer: ask the authority whether wage subsidy may be relevant. The employer—not AQOON and not the jobseeker—receives and applies for the support.

## AQOON preparation checklist

Prepare the person's own description of: target occupation; previous education/work; language level; actual availability and childcare; course or employer details; start date; whether studies have already begun; and questions for the authority. Keep authority correspondence and documents with the person, not in the research repository.

## Outcome evidence

assisted_action: person has been routed to the correct authority or course search with a prepared question set.  
verified_outcome: the person's own authority account, written authority message, training provider offer or employment contract confirms the next step.  
not evidence: a verbal expectation, a course advertisement, an employer's interest or an AQOON match.
