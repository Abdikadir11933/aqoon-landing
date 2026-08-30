# ADR 0003 — Canonical family journey lifecycle contract

Date: 2026-08-30
Status: accepted for implementation, partially implemented (see §6)

This is the design contract required by `docs/qa/handover-2026-08-30-family-
journey-audit.md` before further tracker work: one canonical state machine,
a DB/API transition map, a screen-by-screen UX contract, a prioritized
defect list, and a safe implementation sequence. It builds on — and does not
duplicate — `docs/qa/family-journey-audit-2026-08-30.md` (evidence),
`docs/architecture/interview-and-intake-field-reference.md` (the
category/question/route matrix, deliverable 1, already complete there) and
`docs/architecture/legacy-knowledge-mapping-2026-08-28.md` (knowledge-chunk
handling). Read those first; this file is the synthesis and the plan, not a
restatement of the evidence.

## 1. Why three lifecycle models exist today

| Table.column | Values | Who reads it |
|---|---|---|
| `family_leads.status` | `new`, `contacted`, `resolved` | `tracker/crm-queue-navigation.js` — drives the four CRM queues (incomplete, first_contact, in_progress, resolved) |
| `family_leads.journey_stage` | `reach`, `guide`, `start`, `retention`, `referral`, `resolved` | dashboard journey strip (`visual-v3.js`) |
| `family_case_plans.plan_status` | `research`, `options_ready`, `action_in_progress`, `awaiting_outcome`, `persistence_check`, `resolved`, `closed_unresolved` | `tracker/case-lifecycle.js` panel inside the interview drawer |

They were added at different times for different purposes (queue routing,
funnel visualization, plan tracking) and nothing keeps them consistent.
`save_interview` (in `family-leads-admin`) sets `status=contacted` +
`journey_stage=guide` on interview save; nothing sets `journey_stage=start`
when a plan moves to `action_in_progress`, and resolving a plan does not
touch `family_leads.status` at all (confirmed defect #3 below).

## 2. Canonical lifecycle contract

One lead-level state, `family_leads.status`, becomes the single source of
truth for which CRM queue a family is in. `journey_stage` and `plan_status`
become *views derived from* that one state plus plan state, not independent
inputs a screen can diverge from. New canonical values for
`family_leads.status`:

```
incomplete → first_contact → qualified → in_plan → resolved
                                              ↳ reopened → in_plan
```

| Status | Meaning | Entered when |
|---|---|---|
| `incomplete` | Partial public intake, no confirmed lead yet | Intake started, never finished (existing behavior, unchanged) |
| `first_contact` | Lead exists, no completed first interview yet | Existing `new`/`contacted`-pre-interview behavior, renamed for clarity — **no schema value change required**, this is the existing `new` value with the interview-completed check already used by `crm-queue-navigation.js` |
| `qualified` | First interview completed, no case plan started | New. Entered when `save_interview` completes a `first` interview. Replaces today's silent reuse of `contacted` for this state. |
| `in_plan` | A `family_case_plans` row exists and is not `resolved`/`closed_unresolved` | New. Entered the moment an operator saves a plan via `case-lifecycle.js`. |
| `resolved` | The lead's plan (or the case, if no plan fit) is closed | Entered **only** by resolving the active case plan (§4), or by an explicit "no plan needed" resolution — never by a bare free-text prompt. |
| `reopened` (transient) | A resolved case needs another look | Sets status back to `in_plan` (if a plan exists) or `qualified` (if not) and appends a `family_case_events` row recording why. |

`journey_stage` keeps existing values but is now **computed**, not
independently settable, from `(status, plan_status)`:
`incomplete→reach`, `first_contact→reach`, `qualified→guide`,
`in_plan→start`, `resolved→resolved`. This preserves the dashboard's
existing value set (no chart/label rewrite) while removing the second
source of truth. `retention`/`referral` remain reserved for a future
persistence-check pass on resolved cases, not used yet — do not repurpose
them for something else without a schema note here.

`plan_status` keeps its existing values and remains the detailed state
*within* `in_plan`. The only new rule: whenever a plan transitions to
`resolved` or `closed_unresolved`, the same server-side action must also
set `family_leads.status='resolved'` — atomically, in the same Edge
Function call, not as a UI-triggered second request (defect #3).

Migration cost: this is additive. No existing `status` value is renamed at
the DB level except introducing `qualified` and `in_plan` as new values
existing rows can be backfilled into (`qualified` = has a completed
interview and no plan; `in_plan` = has a non-terminal plan). `contacted` can
remain a deprecated synonym for `first_contact`/`qualified` during
migration rather than being dropped in one pass — see §6 step 2.

## 3. DB/API transition map (current, verified against schema + handover)

| Stage | Edge Function / action | Tables written | Notes |
|---|---|---|---|
| Public intake (partial) | `family-intake-submit` (`verify_jwt:false`, self-validates) | `family_intake_contacts` | Defect #12 (duplicate on finish) lives here — see §5 |
| Public intake (final submit) | `family-intake-submit` | `family_leads` insert/update | `work_diagnostic`/`school_diagnostic`/`programs_diagnostic` columns exist, unused by current UI |
| First contact call | `family-leads-admin` `record_call_outcome` (`call-outcomes.js`) | `family_call_log` insert, `family_leads.last_call_outcome`/`last_call_at`/`next_follow_up_at` | No-answer must never create/advance a lead (already fixed per handover) |
| First interview save | `family-leads-admin` `save_interview` | upsert `family_interviews` on `(lead_id, interview_type)`; `family_leads.status`, `journey_stage`, `interview_status`, `consent_*` | Single-row upsert means a second "follow-up interview" overwrites the first (defect #1 in the numbered list, §5) |
| Route preview | `family-leads-admin` `match_preview` | none (read-only) | Key-presence check only, no value-level rule evaluation (defect #13) |
| Route review | `family-route-review-admin` `save_review` | (route review table) | Requires completed interview + verified route with future recheck date |
| Case plan create/update | `family-case-lifecycle-admin` `save_plan` | `family_case_plans` upsert | Does **not** currently write `family_leads.status` (defect #3) |
| Case plan event | `family-case-lifecycle-admin` (event actions) | `family_case_events` | `case_plan_id`, `event_type`, `event_data` — under-used; see §4 |
| Resolution ("Open resolution") | direct `family_leads` update via CRM | `family_leads.status='resolved'`, `resolved_at`, `journey_stage`, `notes` | Bypasses `family_case_plans`/`family_case_events` entirely (defect #2) |

`knowledge_routes`/`knowledge_criteria`/`knowledge_sources` are read-only
inputs to `match_preview`; nothing in the family journey writes them. The
eight `*_knowledge_chunks` tables (666 rows) are `discovery_only` per ADR-
adjacent `legacy-knowledge-mapping-2026-08-28.md` and must stay out of this
lifecycle entirely — no direct read path from `family-leads-admin` or
`family-case-lifecycle-admin` into any `*_knowledge_chunks` table exists
today, and none should be added.

## 4. Screen-by-screen UX contract

1. **Intake** (`/caawi`) — unchanged scope: contact + presenting need only.
   No lifecycle change needed here beyond fixing the duplicate-on-finish bug
   (§5, defect #12).
2. **First contact** — call outcome logging only. No plan, no route
   preview. Stays exactly as it is (already the correctly-scoped screen per
   the audit).
3. **Qualification / first interview** (`tracker/interview-match.js` +
   enrichment modules) — gathers facts only. Route preview
   (`interview-match-preview.js`) must **not** render here — the module
   stays unloaded exactly as `tracker/CONTEXT.md` already documents (defect
   #7's bundle/doc drift must be resolved by removing it from the bundle,
   not by rewriting the doc — the doc is the correct target state). On
   save: transition `status` to `qualified` (§2), never reopen this same
   drawer for "Review interview" — see next point.
4. **Review interview** (currently `window.openInterview()` reused) — must
   become a **separate read-only view**: summary, answers grouped by topic,
   consent state, universal-evidence conclusions (defect #15). Editing
   requires an explicit "Correct answers" action, which is a distinct,
   logged action, not the default click target.
5. **Follow-up / plan workspace** — becomes the primary screen for
   `qualified` and `in_plan` leads. Order, top to bottom: (a) one-line
   family identity + situation summary, (b) recommended plan / researched
   options with evidence links and their recheck dates, (c) outstanding/
   unconfirmed facts, (d) next action + due date, (e) call history
   (collapsible), (f) full family details (collapsible). This inverts the
   current layout, where family details and empty call history outrank the
   recommendation (defect #8, #9).
6. **Case plan panel** — must offer a real "researched recommendation"
   state before free-text: selectable verified route(s) from `match_preview`
   evidence, an explicit **"None fit" / "Another plan" / "Defer"** outcome
   (defect #16), owner, next date. `plan.status` references must be fixed to
   `plan.plan_status` (defect #4) so the module is not permanently inert.
7. **Resolution** — replaces the free-text browser prompt with a form
   requiring: route/plan reference (or explicit "no plan fit"), evidence,
   who confirmed it, follow-up permission, closure reason. Saving resolution
   both closes the plan and sets `family_leads.status='resolved'` in the
   same call (§2, §3).
8. **Reopen** — a visible action on a resolved case, not a side effect of
   editing old data. Writes a `family_case_events` row with a reason and
   moves `status` back to `in_plan`/`qualified` per §2.

## 5. Prioritized defect list — confirmed vs. design choice

**Fixed this session** (all root-caused via static code reading, not
browser guesswork — see commits `8cbdcf7`, `b82a674`):

- **Branch-handler collision** (numbered defects #1, #4, #11 across the two
  audit docs). Root cause: `interview-form-enhancements.js`'s `enhance()`
  runs on every `#questions` DOM mutation via `MutationObserver` and calls
  `wireChoiceRow()` on **every** `.choice-row`, guarded only by
  `dataset.wired`. `interview-match.js`'s `bindExtras()` — which wires the
  branch-critical rows and calls `applyWorkContext()` to reveal/hide
  dependent questions — never set that flag, so the generic handler always
  overwrote it a tick later (`MutationObserver` callbacks run as
  microtasks, always after the synchronous `bindExtras()` call). Fix:
  `bindExtras()` now sets `dataset.wired='1'`, so the enhancer's own
  existing guard skips those rows instead of clobbering them. This affects
  every branch that depends on a `.match-extra .choice-row`, not just
  Studying.
- **Malformed labels** ("Not Starteded", "kNew it" — defect #14). Root
  cause: `human-labels.js`'s `replaceText()` walked every text node in the
  entire document and did a blind substring find/replace using short,
  generic keys (`'start'→'Started'`, `'new'→'New'`), which also match
  inside unrelated words anywhere on the page — `"started".includes("start")`
  → `"Not started"` becomes `"Not Starteded"`; `"knew".includes("new")` →
  `"knew it"` becomes `"kNew it"`. Fix: split the map into exact-match stage/
  status codes (used only via `cleanElement()`'s attribute-scoped lookup)
  and long, distinctive phrase renames (the only kind safe for a document-
  wide substring pass).

**Confirmed, not yet fixed — implementation-ready** (root cause understood,
low ambiguity):

1. **Resolution bypasses the plan lifecycle** (#2). "Open resolution" (the
   free-text `prompt()` in `crm-queue-navigation.js`'s `mark-resolved`
   action) still writes `family_leads.status='resolved'` directly with no
   route/evidence/owner/date/reason capture — this is the §4.7 structured
   resolution form, a real UI build, not a one-line fix. **Deferred until
   live browser verification is available** (see the live-testing brief
   below); shipping a new operator-facing form blind, in a sandbox that
   cannot exercise it, is not a safe trade.
2. ~~Case-plan resolution doesn't resolve the CRM lead~~ (#3) — done this
   session. `family-case-lifecycle-admin`'s `save_plan` action now updates
   `family_leads.status='resolved'`/`journey_stage='resolved'`/
   `resolved_at` in the same call whenever an existing plan's `plan_status`
   transitions to `resolved` or `closed_unresolved`, mirroring the reverse
   transition the function already did (a new plan already moved the lead
   back to `contacted`). Uses only existing `family_leads.status` values —
   no schema change. Deployed as `family-case-lifecycle-admin` v9 with
   `verify_jwt:false` preserved. This only fixes the *plan-resolution*
   path (`case-lifecycle.js`'s Submitted/Responded/Resolve/Close buttons);
   the separate "Open resolution" shortcut in item 1 above still bypasses
   plans entirely and is not fixed by this.
3. ~~"Next steps suggested" reads `plan.status` instead of
   `plan.plan_status`, and is wired to `window.saveInterview` while the
   active save handler is `interview-match.js`'s local `save()`~~ — done
   this session (commit `b82a674`): `activePlan` now matches
   `case-lifecycle.js`'s own `plan_status!=='resolved'/'closed_unresolved'`
   check, and `save()` calls `window.AqoonNextSteps?.attach()` directly on
   success instead of relying on the dead `window.saveInterview` wrapper.
4. **Route preview is loaded/shown in the wrong phase** (#5, #7) —
   **correction after closer reading**: `interview-match-preview.js` is
   *not* dead or misplaced code to simply delete. It's the only live
   implementation of route review (the Confirm match / Possible — must
   confirm / Does not fit buttons that write to
   `family-route-review-admin`'s `save_review` action, a real, working,
   already-shipped feature per the handover). It is already correctly
   gated — `load()` explicitly checks `interviewCompleted()` and shows only
   a "appears here once this first interview is saved" placeholder
   otherwise, so it never produces a route/eligibility preview from raw
   intake, which the non-negotiable rules require. The actual defect is
   narrower than "loaded when it shouldn't be": it renders inside the same
   `#drawer` surface as the editable qualification interview (via
   `host()` inserting before `.interview-capture`), which is also the
   surface "Review interview" reopens — so a correctly-gated, working
   feature ends up on the wrong screen. Fixing this means re-homing its
   render target into the follow-up workspace (§4.5) once that exists, not
   removing it from the bundle first — deleting it now would regress a
   working feature with nothing to replace it. `tracker/CONTEXT.md`'s "not
   loaded" line is the one that's stale and should be corrected to describe
   current reality once the re-home lands, not the other way around.
5. **Evidence panel is a prompt-text scrape, not persisted evidence** (#6).
   Needs the case-plan schema to carry `selected_option`/evidence links
   (column already exists: `family_case_plans.selected_option jsonb`) —
   this is a UI + save-path gap, not a missing column.
6. **Follow-up decision brief is too thin** (#8) and **"Review interview"
   opens the full editable drawer** (#9). Both addressed by §4.4/§4.5.
7. ~~Duplicate unfinished-intake entries~~ (#12) — done this session. Root
   cause: `family-intake-contact` (partial save), `family-intake-submit`
   (final save) and `family-incomplete-admin`'s `complete` action all
   dedupe correctly on `intake_request_id`/`request_id`, but
   `caawi/app.js` generated and stored that id in `sessionStorage`, which
   clears on tab close. A family that closed the tab and returned later
   got a fresh id, permanently orphaning the first partial contact as
   "incomplete" and creating a second `family_leads` row when an operator
   later completed it. Fixed by moving the id into `localStorage` with a
   72-hour TTL (`getRequestId()`/`setRequestId()` in `caawi/app.js`) — long
   enough to cover a realistic "closed the tab, came back later
   today/tomorrow" gap, short enough that a family returning long after
   their case was already resolved still starts a fresh lead rather than
   silently merging a new need into an old closed one. Verified in
   isolation (fresh/same-tab/within-TTL/expired-TTL/malformed-value cases
   all behave correctly); **not yet observed end-to-end against production
   Supabase**, since the sandbox cannot reach `aqoon.live`'s public intake
   form live — the next live session should submit a labeled synthetic
   intake, close the tab, and confirm no duplicate appears.
8. **Cross-need "Always ask" answers don't reach the follow-up summary**
   (#15). UI-only: the data is already saved in `family_interviews.answers`;
   the follow-up workspace (§4.5) needs to read and summarize it.
9. **No researched-recommendation / "none fit" plan state** (#16), **no
   structured resolution capture** (#17). Both are §4.6/§4.7 scope — design
   is written, implementation is the multi-file follow-up/resolution rebuild
   and should not be rushed ahead of the smaller fixes above.
10. **Only the `work` topic has real conditional branching — root-caused,
    not yet fixed** (the interview-doesn't-follow-scenario defect, #13 in
    the handover's numbered list — distinct from the `match_preview`
    key-presence-only gap in the DB/API map above, which reuses the same
    number in the source doc). `interview-match.js`'s `applyWorkContext()`
    only toggles elements tagged `data-branch="student"` /
    `"student-studying"` / `"working"` / `"jobseeker"` — and `addFields()`
    (line 21) only ever assigns those four `data-branch` values to `work`
    topic fields; every field in `daycare`, `hobby`, `education`,
    `school_child`, `program`, `service_support` gets `data-branch=""` and
    is therefore never hidden. Each of those topics already has a leading
    "scenario" question at the top of its field list (`care_reason`,
    `activity_goal`, `education_entry_reason`, `school_situation`,
    `program_reason`, `authority_issue`) — but it's cosmetic ordering only;
    answering it doesn't filter anything below it, so the full ~10-16
    question list still renders regardless of the answer. Fixing this for
    real means defining, per topic, which leading answer hides which
    downstream fields (mirroring `applyWorkContext()`'s pattern) — a
    genuine design decision per topic, not a mechanical port, and one that
    needs to be checked live (does the right question set actually appear
    for each scenario?) rather than shipped from static reading alone.

**Reported, unverified — must be reproduced with synthetic data before any
fix is attempted** (do not guess a cause):

- The ~59.9s interaction stall on a primary button (#18/#8-in-handover). No
  static code review has located a matching synchronous blocking call yet;
  this needs a live/instrumented reproduction (Performance panel + network
  trace) before touching anything, per the non-negotiable rule against
  fixing unreproduced defects.
- The phone scroll-jump on answer tap. Confirmed structurally risky (fixed
  drawer + two sticky regions, per the audit) but not reproduced on a real
  mobile viewport; needs true device/emulation testing, not another desktop
  pass.

**Design choices, not bugs** — no fix needed, just documentation: the
`need_domain` (route matching) vs. `rt()` (interview topic) vocabulary
mismatch documented in `interview-and-intake-field-reference.md` §4 is
intentional and bridged deliberately; entrepreneurship/program/
service_support having no seeded routes yet is correct "no verified route"
behavior, not a bug.

## 6. Safe implementation sequence

1. ~~Fix the branch-handler collision and label-substring corruption~~ —
   done this session (commit `8cbdcf7`); both are prerequisites for
   reliably testing every other category, since branch questions must
   actually render before their downstream behavior can be audited.
2. Add `qualified`/`in_plan` as valid `family_leads.status` values
   (migration, additive only) and backfill existing rows per §2; keep
   `contacted` accepted as a deprecated synonym in every read path during
   migration so nothing breaks mid-rollout.
3. Make plan-resolution and CRM-resolution atomic in
   `family-case-lifecycle-admin` (§5 items 1–2) — this is the smallest
   change that removes the "stranded in follow-up" failure mode and does
   not require any new UI.
4. Fix the two one-line property/wiring bugs in the Next Steps module
   (§5 item 3).
5. ~~Remove `interview-match-preview.js` from the tracker bundle~~ —
   **retracted**: it's a working feature (§5 item 4, corrected), not dead
   code. Its render target moves to the follow-up workspace together with
   step 7, not as a standalone removal.
6. Trace and fix the duplicate-unfinished-intake defect (§5 item 7) with a
   synthetic Finnish-language intake, before building the new follow-up UI
   on top of a queue that can double-count.
7. Build the read-only "Review interview" view (§4.4) and the reordered
   follow-up workspace (§4.5) reading the already-saved interview/plan data
   — the biggest UI change, done only after 1–6 give it a trustworthy data
   foundation to render.
8. Build the structured resolution form (§4.7) and reopen action (§4.8) on
   top of the same case-plan/event tables.
9. Reproduce the 60s stall and the phone scroll issue with instrumented
   synthetic sessions; fix only what is actually reproduced.
10. Re-run `node --test tests/*.test.js`, all `scripts/*_qa.py`, rebuild
    `tracker/bundle.js`/`bundle.css`, and verify the Vercel production
    deployment is `READY` and aliased to `aqoon.live` before calling any
    step in this sequence "live".

Each numbered step above should be its own commit with its own test/QA run
— per the non-negotiable rule against calling the audit or a fix complete
on static tests alone, every step touching branch logic or lifecycle state
needs a live/synthetic-data check in the tracker, not just `node --test`.
