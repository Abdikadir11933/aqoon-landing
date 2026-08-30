# AQOON interview scenario matrix (2026-08-30)

The intake category is only the entry point. It must never decide a benefit,
programme, school route, or eligibility result. The first interview identifies
the person's situation, then asks only the facts that can change the next
research route.

## Shared situation gate

Every interview begins with a short gate, regardless of the intake category:

1. Who is this mainly about? Adult / child / household.
2. What is happening now? Studying, working, seeking work, caring for a child,
   starting a new study path, dealing with an authority matter, or mixed/unsure.
3. What is the immediate goal? Work, study, school support, childcare,
   activity, benefit/letter help, or another concrete next step.

These are context fields, not eligibility answers. `Not sure` is valid and
must route to clarification questions rather than being silently converted.

## Scenario packs

| Scenario | Decisive facts to ask next | Research output |
|---|---|---|
| Student seeking part-time work | study path, timetable, expected completion, work hours, support/benefit question | compatible work options + authority-confirmed support questions |
| Student seeking full-time work or changing study path | current study status, reason for change, target date, prior education, language | education/work transition routes |
| Employed, seeking additional or changed work | current hours, desired change, schedule, contract/qualification constraints | realistic additional-work routes |
| Unemployed jobseeker | registration, plan, duration, availability, right-to-work confirmation | jobs and employment-service routes |
| Education-first / new student | prior education, literacy, language, residence context, childcare/time/cost | current study and preparation routes |
| Childcare / early education | child age, municipality, start date, schedule, guardians' work/study reason, cost/provider preference | municipal/private/esiopetus routes |
| School-age child | grade, current school route, Finnish/S2 context, support already tried, meeting/deadline | school support and official contact route |
| Hobby / activity | grade/age, school/area, interest, schedule, cost/accessibility, registration state | current activity options |
| Authority / benefit / letter | responsible system, letter/decision stage, deadline, requested documents, help goal | explanation, source, preparation checklist; never a decision |
| Mixed or uncertain | ask which situation is most urgent, then the smallest relevant pack | one primary route plus clearly marked unknowns |

## Where programmes and funds belong

“Programme”, “fund”, “benefit”, and “route” are research outputs, not intake
categories. A person entering through work may be matched to a study programme;
a student may need a work route or an authority question; a school request may
reveal a household benefit or childcare constraint. The system should therefore
store the scenario and the confirmed need separately, then let the researched
route attach to the case with source, caveat, and next action.

## Required operator view after save

The saved result must show: situation, primary goal, decisive facts, missing
facts, one recommended research direction, source links when verified, and the
next question/action. It must not show a generic list of programmes or imply
that a benefit, place, admission, job, or authority outcome is confirmed.

This matrix is the design gate for the next implementation pass. The field
reference and downstream route criteria must be updated whenever a new scenario
pack is added.
