# Family Research Context

Pipeline:
1. `stages/01-case-routing/CONTEXT.md`
2. `stages/02-source-plan/CONTEXT.md`
3. `stages/03-live-research/CONTEXT.md`
4. `stages/04-match-evaluation/CONTEXT.md`
5. `stages/05-case-brief/CONTEXT.md`
6. `stages/06-human-review/CONTEXT.md`

Inputs are structured case facts from private systems. References are public canonical knowledge. Outputs are case-specific and must remain private unless explicitly sanitized.

High/live knowledge always triggers fresh source verification.

## First-interview inputs

The tracker stores two different kinds of first-interview data:

1. **matching criteria**: age, municipality, grade, jobseeker status, language, schedule, childcare, programme criteria and other facts needed to identify viable options;
2. **evidence/learning fields**: acquisition source, prior awareness, self-navigation, barriers, other needs discovered and route-specific pilot questions.

Do not use an evidence/learning answer as an eligibility fact unless it independently matches the programme's real criteria. Example: `did not know the programme existed` is useful pilot evidence but does not make someone eligible.

When the first interview reveals an additional need, preserve it as a separate confirmed need/route rather than silently expanding the original request. Research each confirmed route against its own criteria.

For hobby cases, grade and municipality are high-value matching facts and should be preserved exactly. For daycare/private-daycare cases, prior awareness or cost beliefs are evidence fields; current municipality, child/care situation, timing and application status drive matching.
