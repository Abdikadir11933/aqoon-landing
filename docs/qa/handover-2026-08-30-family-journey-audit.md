# AQOON handover — family journey audit continuation

Date: 2026-08-30  
Repository: `Abdikadir11933/aqoon-landing`  
Branch: `master`  
Production: Vercel → `aqoon.live`  
Supabase project: `qxracwbsyfibcelasxbs`

## Read this first

Read the root `CLAUDE.md`, `tracker/CLAUDE.md`, `tracker/CONTEXT.md`,
`docs/architecture/legacy-knowledge-mapping-2026-08-28.md`, and
`docs/architecture/interview-and-intake-field-reference.md` before editing.
Never touch `pilke/` without an explicit request. Supabase CRM tables are
operational truth; markdown is not a substitute for database state.

The user explicitly wants a complete audit before another large redesign:
public intake → first contact → qualification interview → research/follow-up
→ resolution. Map every question, branch, API write, queue transition, plan,
event, and operator-visible fact. Do not add another question pack or UI widget
until the canonical lifecycle and data contract are written down and accepted.

## What happened in the previous session

The previous agent shipped and verified a series of changes on `master`:

- Somali terminology and SEO metadata were updated across public pages.
- The `Carruurta` taxonomy was renamed to `Carruur iyo skuul`, including two
  Edge Function priority checks.
- Verified route preview was wired to `family-leads-admin` `match_preview`.
- Incomplete-intake call outcomes were fixed so “no answer” cannot create a
  placeholder lead or move it to First Contact.
- Tracker assets were concatenated into `tracker/bundle.js` and
  `tracker/bundle.css`; rebuild after every tracker source change.
- Interview consent fields were added and saved as
  `relevant_updates_ok` / `outcome_followup_ok` in `family_interviews.answers`.
- Route review buttons now call `family-route-review-admin` `save_review`.
- Three broken Next Steps selectors were replaced with usable panel targets.
- Mobile h1 breakpoints were added to the affected Somali pages.
- The public intake submit function was repaired in production by deploying
  `family-intake-submit` with `verify_jwt: false` (the handler performs its own
  validation). A synthetic intake was submitted successfully end-to-end.

Latest production deployment verified during this session:

- Vercel deployment `dpl_sD3MNjfDvNwLCy6sbcZ6bZDCWJK1`
- status `READY`, production, aliased to `aqoon.live`
- built from commit `95de01c89b0e16e793b21318ce2663ed51934839`

The production bundle was checked for `case_subject`, confirming that the
current universal interview fields reached Vercel.

Verification already run:

- `node --test tests/*.test.js`: 54/54 passed
- `node --check tracker/*.js`: passed
- `repo_integrity_qa.py`, `site_qa.py`, `usability_qa.py`,
  `check_seo_metadata.py`, `legal_trust_qa.py`: passed
- known warnings inside `pilke/` remain out of scope

The sandbox cannot directly reach `aqoon.live` or Supabase function URLs with
curl/Playwright because of the egress proxy. Supabase MCP and Vercel MCP work.
The authenticated cloud browser was used successfully for read-only tracker
inspection. No real family record was edited, no call was placed, and no
resolution action was run.

## What was found in the live audit

The full evidence report is in
`docs/qa/family-journey-audit-2026-08-30.md`. The most important conclusion is
that the system has several partially overlapping lifecycle models but no one
canonical state machine:

| Layer | Current values | Reality |
|---|---|---|
| `family_leads.status` | `new`, `contacted`, `resolved` | Drives the four CRM queues |
| `family_leads.journey_stage` | `reach`, `guide`, `start`, `retention`, `referral`, `resolved` | Drives dashboard journey visualization |
| `family_case_plans.plan_status` | research/options_ready/action_in_progress/awaiting_outcome/persistence_check/resolved/closed_unresolved | Exists in a separate panel and does not consistently move the lead |

Production aggregate state at audit time was 27 leads, 9 incomplete intakes,
26 first-contact leads, 1 completed interview, 0 case plans and 0 reviewed
match runs. This means much of the apparent follow-up/resolution workflow has
not been exercised in real data.

### Live UI evidence

Opening the single completed interview in the logged-in tracker showed:

- the follow-up decision brief only contains a route label, criteria count,
  terse situation line, and “Next action not recorded yet”;
- family information, action controls and empty call history occupy more visual
  emphasis than the recommendation, evidence, unknown facts and plan;
- “Review interview” opens the entire editable first-interview drawer again;
- verified route cards appear above the context questions;
- the saved research result is not a concise operator-facing plan;
- “Open resolution” is a browser prompt/free-text note that directly updates
  `family_leads` to resolved.

The synthetic test record was opened without saving. On selecting
`primary_situation = Studying`, the answer visibly became selected but the
student-specific fields stayed hidden. This is a confirmed deployed logic bug,
not merely a UX preference.

### Confirmed technical cause of the student branch failure

`tracker/interview-match.js` binds the branch-aware click handler in
`bindExtras()`, including `applyWorkContext()`. Later,
`tracker/interview-form-enhancements.js` calls `wireChoiceRow()` on every
choice row and replaces the existing `onclick` handler with a generic handler
that only toggles `.on`. It never calls `applyWorkContext()`.

Result: selecting Studying, Working, or another branch can record the answer
while failing to reveal or hide dependent questions. This affects more than
students: jobseeker, working, child and other conditional contexts can also be
wrong or remain visible together.

The normal choice handler itself does not deliberately call `scrollIntoView()`.
On a desktop-sized browser, unsaved answer taps kept the internal drawer scroll
context. The reported phone jump still requires true mobile reproduction; the
fixed full-screen drawer plus sticky header and sticky save bar is a strong
structural suspect.

## Current architecture and data connections

### Public intake

- UI: `caawi/index.html`, `caawi/app.js`
- submit function: `supabase/functions/family-intake-submit/index.ts`
- intake persists contact and final lead data into CRM tables
- public form intentionally collects only contact, city, category,
  subcategory and optional additional needs
- declared diagnostic fields (`work_diagnostic`, `school_diagnostic`,
  `programs_diagnostic`) are not currently populated by UI

Keep intake short. The missing situation context belongs in a deliberate
qualification step, not an overlong public form.

### Tracker shell and queues

- `tracker/index.html` loads `/tracker/bundle.js?v=1`
- `scripts/build_tracker_bundle.js` concatenates tracker JS/CSS; rebuild after
  every source edit
- `tracker/app.js` loads leads, partials, programs and shared state
- `tracker/crm-queue-navigation.js` renders four queues:
  incomplete, first_contact, in_progress (“Interview follow-up”), resolved
- `tracker/crm-call-history.js` reads/writes call history
- `tracker/call-outcomes.js` handles reached/no-answer/busy/call-later

Queue mapping currently treats every `status=contacted` lead as interview
follow-up. There is no separate saved interaction for a later research call.

### First interview

- active form builder: `tracker/interview-match.js`
- enrichment/rewiring: `tracker/interview-form-enhancements.js`
- universal proof questions: `tracker/universal-proof-questions.js`
- answer restore: `tracker/interview-answers-restore.js`
- context recap and next steps: `tracker/interview-context.js`,
  `interview-follow-up-recap.js`, `interview-next-steps.js`
- route preview: `tracker/interview-match-preview.js`
- case plan panel: `tracker/case-lifecycle.js`

The active save function posts `action=save_interview` to
`family-leads-admin`. It saves an answer object, summary, raw research prompt,
follow-up time and urgency. The Edge Function upserts one
`family_interviews` row on `(lead_id, interview_type)`, then sets the lead to
`status=contacted`, `journey_stage=guide`, and interview completed.

That means reopening/re-saving the interview overwrites the same interaction;
it is not a second follow-up interview.

### Edge Functions

- `family-leads-admin`: list, save interview, match preview, lead updates
- `family-route-review-admin`: strict save-review gate; requires completed
  interview and verified route with future recheck date
- `family-case-lifecycle-admin`: case plan/event/future opportunity actions
- `family-intake-submit`: public intake submit; production `verify_jwt=false`
- `family-incomplete-admin`: incomplete intake operations

Before changing any Edge Function, inspect its current `verify_jwt` setting
with Supabase MCP and redeploy using the exact existing setting.

### Knowledge and matching

The eight populated legacy `*_knowledge_chunks` tables (666 rows total) are
raw discovery material, not verified operational data. They are intentionally
inert. Do not wire live UI or vector search directly to them. Read
`docs/architecture/legacy-knowledge-mapping-2026-08-28.md` and manually verify
useful candidates against current primary sources before adding downstream
`knowledge_sources`, `knowledge_criteria` and `knowledge_routes` rows.

`match_preview` currently evaluates mostly whether required keys are present;
it does not generally evaluate value-level rules. Therefore a student with
part-time work can still receive unemployment/jobseeker routes as “Possible —
must confirm” even when that is a misleading first recommendation.

## New mandatory reproduction cases from the latest live pass

- A newly submitted Finnish intake appeared in the unfinished queue; filling
  it again as an operator produced another entry. Trace final submit, partial
  writes, deduplication, language mapping, final lead write and queue refresh.
- Daycare, hobby and education intakes open large generic forms instead of a
  short scenario-first qualification flow. Verify the selected category really
  controls question routing.
- Live labels include malformed choices such as “Not Starteded” and “kNew it”.
  Audit every label, option value, answer key and criteria bridge.
- “Always ask” answers are collected but their conclusions do not reach the
  follow-up summary or useful aggregate analytics.
- After saving, the case plan says “No active case plan yet”; there is no
  researched recommendation, selectable plan, evidence panel or explicit
  “none fit / another plan / defer” outcome.
- “Open resolution” asks for a plan/note despite no plan existing and gives no
  structured route, evidence, owner, next date or closure reason.
- A live performance marker reported a primary button whose handlers blocked UI
  updates for about 59.9 seconds. Reproduce with synthetic data and trace the
  exact network/long-task path; treat this as a severe interaction defect.

## Remaining work — execute in this order

1. Finish the audit matrix for every intake category: work, education, daycare,
   child school/support, hobbies, programmes/training, authority/benefit and
   general/other. For each, map trigger → questions → hidden/visible branch →
   saved answer key → criteria key → route → follow-up action.
2. Test the generic choice-handler collision for working, child and other
   branches, not only studying. Record exact failures before fixing.
3. Trace `save_interview` round-trip with a synthetic scenario and inspect the
   resulting database row. Confirm summary, answers, consent, research prompt,
   interview status and lead transition.
4. Define the canonical lifecycle contract before coding. The intended shape
   is: intake → qualification → research-ready brief → follow-up plan/options
   → action/outcome → resolved/closed, with explicit reopen path.
5. Redesign follow-up around the operator’s first five seconds: compact family
   identity, one-sentence situation summary, recommended route/plan, evidence
   links, missing confirmations, next action, call history and one clear
   outcome control. Family info and history should be collapsible.
6. Separate read-only review from editable interview. Never send “resolution”
   back to the first-interview form. A later interaction needs its own record
   or explicit case event.
7. Make case-plan completion and CRM resolution atomic or explicitly linked;
   a plan marked resolved must not leave the lead stranded in follow-up.
8. Fix branch binding once at the shared event layer so no later enhancer can
   overwrite conditional logic. Add behavioral tests, not only string tests.
9. Reproduce phone scrolling with a real mobile viewport and keyboard. Keep
   one scroll container, avoid competing sticky regions, preserve position
   after answer selection, and keep the primary action reachable.
10. Only after the lifecycle and question audit is accepted, implement the
    fixes, rebuild bundles, run all tests/QA, commit with a “why”, push
    `origin master`, and verify Vercel `READY` + `aqoon.live` alias.

## Non-negotiable safety rules for the next agent

- Do not include passwords, tokens, phone numbers or family names in files,
  logs, commits or final messages.
- Do not edit real family records while reproducing the flow.
- Synthetic test records are permitted, but label them clearly and do not
  silently delete them; ask before destructive cleanup.
- Do not touch `pilke/`.
- Do not claim a recommendation is eligibility or an authority decision.
- Do not surface raw knowledge chunks directly to operators or families.
- Do not call the audit complete merely because static tests pass; static tests
  do not prove branch behavior or lifecycle transitions.

## Handoff outcome

The previous session did not complete the redesign. It repaired intake submit,
added broad context fields and shipped several supporting fixes, but the live
audit now proves that contradictory handlers and competing lifecycle models
still prevent the system from understanding and carrying a case cleanly from
intake through resolution. The next agent must continue from this evidence,
finish the category-by-category matrix, then implement one coherent lifecycle
with a concise evidence-backed follow-up workspace.
