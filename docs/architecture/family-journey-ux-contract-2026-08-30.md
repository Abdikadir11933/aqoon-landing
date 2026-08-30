# AQOON family journey: UX and data contract

Status: design contract for the next implementation pass (2026-08-30).

This document defines the single operator journey before further tracker
changes. It is deliberately concise: every screen should expose the next
decision, not the whole database.

## 1. One case line

```text
Intake → Qualify → Research → Recommend → Plan → Follow up → Outcome → Resolved
```

The family has one case record. A case may have multiple needs, routes and
plans, but only one current stage and one next action. CRM status, lifecycle
plan status and interview status must not independently disagree.

### Stage meanings

| Stage | Entry condition | Exit condition | Operator must see |
|---|---|---|---|
| Intake | Contact submitted or partial contact saved | City + one need confirmed | Missing intake facts and one recovery action |
| Qualify | Intake is complete | Situation and scenario are known | Primary need, life situation, constraints |
| Research | Interview saved with required facts | Current sources checked | Unknowns and research work remaining |
| Recommend | Evidence-backed route exists | Family has a proposed next step | One best route, why, source, caveats |
| Plan | Family/authority action chosen | Action completed or awaiting response | Owner, action, due date, evidence |
| Follow up | Action or response is pending | Outcome recorded | What changed, what to do now |
| Outcome | A response/result is known | Resolved or closed without resolution | Result, source/evidence, next decision |
| Resolved | Outcome is documented | Reopen only with a new plan | Resolution reason and audit trail |

No stage transition is allowed merely because a button was clicked. Each
transition requires the minimum evidence shown above.

## 2. Tabs and information hierarchy

### Today

Purpose: decide what to do next in under 30 seconds.

Show only:

- overdue and due actions;
- incomplete intakes needing recovery;
- unassigned cases;
- cases waiting on an authority/provider;
- one count per queue and one next-action list.

Do not show raw family details, long prompts or ten competing charts. Use a
small queue count, age/SLA indicator and a single action button.

### Families

Purpose: find and open one case.

Each card shows:

- name;
- current stage;
- primary need + city;
- owner;
- next action and due time;
- one risk marker (overdue, blocked, missing information).

Opening a card uses a compact case panel. Family/contact metadata is collapsed
by default. The first visible content is the current decision brief.

### Case panel

The panel order is fixed:

1. **Decision brief** — one-sentence situation, primary need, current best
   route, confidence label, and the next action.
2. **Why / evidence** — up to three decisive facts and up to three official
   source links; expandable for detail.
3. **Plan** — owner, action, due date, plan status, and “record outcome”.
4. **Call / contact** — Call and Log outcome, compact.
5. **Interview answers** — drill-down only.
6. **Family info** — drill-down only.
7. **History** — call and lifecycle events, collapsed.

The panel must never require opening the interview just to understand what the
case means or what should happen next.

### Interview

Purpose: collect facts, not display a premature match decision.

Order:

1. Situation gate (student/working/unemployed/parent/other).
2. Primary goal and competing needs.
3. Scenario-specific qualifying questions.
4. Constraints (time, language, travel, childcare, cost).
5. Universal evidence questions.
6. Additional information/specify (free text, never auto-filled).
7. Consent, urgency, next call.

No route preview is shown until this interview is saved. A saved interview may
produce a research brief, but it must not claim eligibility.

### Research / recommendation

The operator-facing result is not the raw prompt. It is a structured brief:

- situation summary;
- one recommended route;
- why it fits the recorded facts;
- unknown or authority-confirmed criteria;
- official evidence links;
- exact next action;
- fallback route only when genuinely useful.

The raw research prompt remains available as an expandable technical detail.

### Follow up

Purpose: execute the plan and record what happened.

The first viewport must contain:

- decision brief;
- recommended plan;
- evidence links;
- next action and due time;
- Call / Log outcome.

“Review interview” is secondary. Family Info and Call History are collapsible.

### Resolved

Purpose: verify that the case ended with a documented result.

Required fields:

- outcome type: resolved / closed without resolution;
- short outcome note in the operator’s words;
- evidence or official response, when applicable;
- date and operator;
- whether a future opportunity was created.

Resolved is not a deletion and not a generic status toggle. Reopening creates a
new active plan while preserving the previous outcome.

### Analytics

Purpose: answer a small number of operational and evidence questions.

Show conditional denominators and compact visualizations:

- intake → interview → recommendation → plan → outcome funnel;
- due/overdue workload by stage;
- scenario counts (student/work, student/part-time, unemployed, etc.);
- route outcomes and unresolved reasons;
- awareness/blocker measures only among people actually asked.

Every chart must display its denominator and date range. Raw family names and
free-text notes do not belong in aggregate charts.

### Sales

Purpose: manage organisation-level opportunities separately from family cases.

Family demand may be aggregated into sales demand, but a sales opportunity is
not a family resolution and must not be presented as one.

## 3. Interview scenario contract

The entry category is not the scenario. The first three questions must identify
the scenario before route-specific questions appear.

Required scenario families:

- student seeking part-time work;
- student seeking full-time work or changing study path;
- unemployed jobseeker;
- employed person seeking additional/changed work;
- education-first / new student;
- family/childcare or school support;
- mixed or uncertain situation.

Each scenario defines its own required facts. “Additional information” supplies
nuance and is included in research, but cannot silently satisfy a required
structured criterion.

Retrospective questions (AQOON awareness, self-navigation, return intent and
similar measures) are evidence fields, not route qualifiers and not blockers.

## 4. Data ownership rules

- `family_leads` owns the current case stage, owner, next action and contact
  summary.
- `family_interviews` owns immutable-ish interview versions and structured
  answers.
- `knowledge_sources`, `knowledge_criteria` and `knowledge_routes` own
  verified discovery/recommendation evidence.
- `family_case_plans` owns the active action plan.
- `family_case_events` owns transitions and outcome evidence.
- `family_call_log` owns call attempts and outcomes.

The UI must derive its decision brief from these records; it must not invent a
second status in local storage or from an unpersisted prompt.

## 5. UX acceptance checks

Before any feature is called complete, verify:

1. An operator can identify the current situation and next action without
   opening the interview.
2. A student/part-time case never receives unemployment-only questions as its
   primary path.
3. A route card cannot appear from an unsaved interview.
4. A recommendation shows source, decisive facts and unknowns together.
5. A call outcome cannot silently create, resolve or reclassify a case.
6. Resolution records an outcome and evidence in the same case timeline.
7. Mobile answering preserves scroll position and keeps the next unanswered
   question reachable.
8. Every aggregate metric states its denominator and observation window.

