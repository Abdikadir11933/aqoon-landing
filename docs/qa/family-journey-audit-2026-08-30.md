# Family journey audit — 2026-08-30

Scope: current live implementation of the family flow, from `/caawi` intake
through tracker first contact, first interview, follow-up and resolution.
This is an implementation audit, not a proposed redesign. The browser/UI
code, deployed Edge Functions and production schema are the sources of truth.

## Executive finding

The system has the necessary *tables* for a proper assisted journey, but the
operator experience currently joins together three different lifecycle models
without one canonical state machine:

| Model | Values currently used | What the operator sees it as |
|---|---|---|
| `family_leads.status` | `new`, `contacted`, `resolved` | CRM queues |
| `family_leads.journey_stage` | `reach`, `guide`, `start`, `retention`, `referral`, `resolved` | Dashboard journey strip |
| `family_case_plans.plan_status` | `research` through `resolved` / `closed_unresolved` | A panel inside the interview drawer |

There is no single UI that advances all three consistently. In production at
audit time there are 27 leads, 1 completed interview, 0 case plans and 0
reviewed match runs. The live operator UI was then opened against the completed
interview without editing it: it confirmed that the apparent follow-up and
resolution features are largely unexercised and should not be treated as a
proven workflow.

## Current journey, verified

| Stage | What actually happens now | Data written | Main issue |
|---|---|---|---|
| Public intake | Name and phone are saved first, then city, category, subcategory, optional additional needs and contact consent. | `family_intake_contacts`; final submit creates/updates `family_leads`. | No situation signal is collected. `work_diagnostic`, `school_diagnostic` and `programs_diagnostic` exist in the payload/schema but the public UI never sets them. |
| First contact | Operator can call and must log reached/no answer/busy/call later. Non-reached requires a future follow-up time. | `family_call_log`, lead last-call fields and due time. | Good separation for incomplete intake: logging does not create a lead. |
| First interview | The drawer asks route-specific and universal questions, saves a research prompt, then changes lead to `contacted` + `guide`. | One upserted `family_interviews` row plus lead fields. | It is both qualification form and research-brief generator, but has no dedicated read-only review state. |
| Follow-up queue | Every `contacted` lead appears here. It renders a compact decision brief from the interview summary and raw prompt. | No additional record. | This is the correct *location* for decision support, but it does not contain a saved research result, selected option or evidence-backed plan. |
| Resolution | “Open resolution” opens a browser prompt for a free-text outcome note, then directly sets the lead to `resolved`. | `family_leads.status`, `resolved_at`, `journey_stage`, `notes`. | It bypasses case plans/events and gives no structured plan, action, source, result, follow-up or closure reason. |

## Question and matching audit

### Intake

The intake is deliberately short and should stay low-friction. It currently
collects the presenting need, not the deciding context. That is appropriate
for a public entry form, but means the next screen must explicitly obtain the
three deciding facts before matching:

1. who the case is mainly about;
2. their current life situation;
3. the most important immediate goal.

Those fields exist in `tracker/interview-match.js` as `case_subject`,
`current_situation`, and `immediate_goal`. They are not a substitute for a
clear first-contact/qualification sequence because they are currently mixed
into a long technical first-interview drawer.

### Work + student example

The current work branch now collects student status, work intent, study path,
student schedule and benefit context. That is an improvement over the older
unconditional jobseeker questionnaire.

However, `match_preview` does not apply answer values as eligibility/exclusion
logic. Apart from city and one Vantaa private-daycare special case, it only
reports missing inputs. A student looking for part-time work can therefore be
shown jobseeker/general-unemployment routes even where those routes are not
the first thing to investigate. The display label says “Possible — must
confirm”, but the recommendation order is still misleading.

There is also a live branch-rendering failure. In the synthetic student
scenario, selecting `primary_situation = Studying` leaves `study_path`,
`student_schedule`, `study_completion` and `student_benefit_context` hidden.
`interview-match.js` initially binds a handler that calls `applyWorkContext()`,
but the later `interview-form-enhancements.js` rewires all `.choice-row`
buttons and replaces that handler without calling `applyWorkContext()`. The
answer is selected, but the deciding student questions cannot be asked.

The cause is structural: `knowledge_routes.required_inputs` checks whether a
value exists; it does not encode or evaluate value-level rules such as
“studying + part-time work” versus “unemployed and seeking full-time work”.

### Other domains

Education, daycare, school, hobby, programme, authority/support and general
intakes all have scenario-identifying fields. Their main shared gap is the
same: qualification answers are saved, but no post-interview research result
is stored in a canonical operator-facing plan. A route preview therefore
cannot become the tailored recommendation the operator needs.

## Confirmed implementation defects

1. **Follow-up is not a separate interaction.** Opening “Review interview”
   calls `window.openInterview()`, which reopens the editable first-interview
   drawer. `save_interview` upserts on `(lead_id, interview_type)`, so another
   save overwrites the same interview record instead of storing a second
   follow-up conversation.
2. **Resolution bypasses the intended lifecycle.** CRM resolution directly
   updates `family_leads`; it neither requires nor updates
   `family_case_plans` / `family_case_events`.
3. **Case-plan resolution does not resolve the CRM lead.** The plan panel can
   mark a plan `resolved`, but that action does not set `family_leads.status`
   to `resolved`. The family can remain in Interview follow-up indefinitely.
4. **The “Next steps suggested” module is effectively inert.** It reads
   `plan.status`, while the schema and lifecycle API use `plan_status`; it
   also is wired through `window.saveInterview`, while the active button is
   replaced by `interview-match.js`'s local `save()` handler.
5. **Route preview is placed in the wrong phase for this workflow.** The
   module is bundled and shown in the editable interview drawer after a
   completed interview. It contains route review buttons, while the desired
   product contract is: interview gathers facts; follow-up presents the
   researched recommendation and evidence.
6. **The evidence panel is a prompt, not evidence.** It extracts URLs from
   the generated research prompt. It has no persisted source verification,
   research result, selected option or operator rationale to show.
7. **Documentation/runtime drift exists.** `tracker/CONTEXT.md` says the
   route-preview module is deliberately not loaded; the bundle builder loads
   it. The e2e testing skill still describes a six-phase lifecycle that does
   not match the current four CRM queues.
8. **The live follow-up decision brief is too thin to guide a call.** It shows
   route labels, a criteria count, a terse situation line and no recorded next
   action. The family details, action buttons and empty call-history region
   take more visual emphasis than the recommendation, evidence and unresolved
   questions the operator needs first.
9. **Completed-interview review is visibly in the wrong mode.** The live
   “Review interview” action opens the full editable qualification drawer. The
   verified-route cards appear before the context facts and the long question
   list, while neither the saved research brief nor an operator-ready case
   plan is surfaced first. This exactly reproduces the reported experience.
10. **The phone layout has a real structural risk.** The interview is a
    full-screen fixed drawer containing two sticky regions: its header and a
    permanently sticky Save button. On small screens the button consumes about
    54px plus padding and the drawer's internal scrolling context is separate
    from the page. The implementation contains no intentional scroll on a
    normal answer tap, so the reported jump must be reproduced with a synthetic
    case before changing it; however this layout makes focus/scroll instability
    substantially more likely and leaves little usable question viewport.
11. **Student branching is broken in the deployed form.** A later generic
    choice-row enhancer overwrites the branch-change handler. Selecting
    “Studying” does not reveal the student-specific question set, despite
    `primary_situation` visibly showing the selected answer.

The normal choice-button handlers were also exercised on an unsaved synthetic
interview in the desktop-sized live browser. They did not reset the drawer to
its top; the drawer stayed in its internal scroll context. That does **not**
clear the phone defect: this browser cannot reproduce the actual iPhone visual
viewport, keyboard and touch-focus behavior. It narrows the probable cause to
the mobile fixed/sticky drawer layout or a touch-specific browser behavior,
not a deliberate `scrollIntoView()` inside the normal choice handler.

## Additional defects reported during the next live pass

These are mandatory reproduction cases for the next implementation pass:

12. **A completed Finnish intake can still appear as incomplete.** A newly
    submitted Finnish intake appeared in the unfinished queue; filling it
    again as an operator produced another entry. Trace the submit response,
    partial-intake write, deduplication key, language-specific mapping, final
    `family_leads` write and queue refresh.
13. **The interview route is not driven by the selected intake scenario.**
    Daycare, hobby and education intakes open large generic forms instead of
    a short scenario-first flow that asks only deciding questions.
14. **Live choice labels and values contain defects.** Examples include
    “Not Starteded” and “kNew it”. Audit every displayed label and every
    `data-key`/stored value/criteria bridge; unclear choices make matching
    unreliable, not merely unattractive.
15. **Cross-need questions are collected but not concluded.** The “Always ask”
    block captures awareness, barriers, children, future work and permissions,
    but the follow-up summary does not show what those answers mean.
16. **No actionable plan is available after interview completion.** The case
    plan only says “No active case plan yet” and offers a free-text “Start plan”
    field. There is no researched recommendation, selectable plan, evidence, or
    explicit “none fit / another plan / defer” outcome.
17. **Resolution has no plan workflow.** “Open resolution” asks for a note
    despite no plan existing and does not capture route, evidence, owner, next
    date or closure reason.
18. **A severe interaction stall was reported.** The browser identified a
    primary button whose handlers blocked UI updates for about 59.9 seconds.
    Reproduce with synthetic data and capture the exact request/long-task path
    before dismissing this as a browser artifact.

## Required target contract before the next implementation pass

The product should use one visible operator journey while retaining the
existing audit-history tables:

1. **Intake:** contact + presenting need only; preserve the fast public form.
2. **Qualification / first interview:** establish person, situation, goal and
   only the branch facts that can change the next research question.
3. **Research preparation:** save a structured brief; no route promise in the
   interview UI.
4. **Follow-up / plan:** the primary screen. Show a compact case summary,
   researched options, current sources, recommended action, outstanding facts,
   call history and a deliberate action/outcome capture.
5. **Resolved / closed:** record result, evidence, who/what confirmed it,
   follow-up permission and reopen path; then atomically make the CRM state
   resolved.

The next build pass must define one canonical transition contract between
lead state and case-plan state, then implement the follow-up panel around it.
It must not add more question packs or another preview widget before that
contract exists.

## Audit limitations

- The public intake was browser-tested with synthetic data after the submit
  endpoint repair and completed successfully.
- The signed-in live tracker was navigated read-only for a completed interview
  and an unsaved synthetic interview. No real family record was edited, no
  call was placed and no resolution action was run.
