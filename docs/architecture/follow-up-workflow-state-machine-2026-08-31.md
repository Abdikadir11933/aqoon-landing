# AQOON follow-up workflow state machine

Status: implementation contract, 2026-08-31.

This refines `family-journey-ux-contract-2026-08-30.md` using the two 31 Aug screen recordings as the current UX truth.

## Phase ownership

The Family CRM phase queues own different jobs. A queue must not expose controls that belong to a later phase.

| CRM phase | Purpose | Primary action | Must not show |
|---|---|---|---|
| Incomplete intake | Recover and finish the request | Finish / recover intake | Route review, case plan, resolution |
| First contact | Reach the family and understand the case | Call / log outcome / complete first interview | Premature route recommendation, resolution |
| Interview follow-up | Choose and execute the best verified route | Current guided follow-up step | Raw lifecycle controls from future steps |
| Resolved | Show the documented result | Reopen only when needed | Active-plan controls |

Saving a completed first interview is the handoff from First contact to Interview follow-up. A terminal case-plan state is the handoff to Resolved.

## Follow-up is one sequence

The operator sees one current step, not every available backend state.

```text
1 Review route -> 2 Agree route -> 3 Take action -> 4 Record result -> 5 Confirm outcome
```

### Step 1 — Review route

Entry: completed first interview, no chosen active route.

Show:
- verified candidate routes;
- decisive missing facts / conflicts;
- official next steps and sources;
- `Use this route`, `Possible — confirm first`, `Does not fit`.

Rules:
- `Possible` does not advance.
- `Does not fit` removes the route from the current decision set.
- `Use this route` persists a confirmed match and creates/updates the active case plan automatically.
- The operator never types a plan name. The plan title comes from the verified route.

Exit: one route is selected and persisted.

### Step 2 — Agree route with family

Show only:
- chosen route;
- short reason / suggested first action;
- `Family wants to proceed`;
- `Choose another route`.

Do not show submission, waiting, outcome or resolve controls yet.

Exit: family proceeds with this route.

### Step 3 — Take the action

Show only:
- chosen route;
- the concrete next action;
- optional action note;
- `Action done — wait for result`;
- `Route changed — go back`.

Examples: application submitted, registration made, appointment booked, document sent, option explained and agreed.

Exit: action is actually recorded.

### Step 4 — Record result

Show only:
- current route/action;
- response/result note;
- next follow-up time when still waiting;
- `Result received`;
- `Still waiting — save follow-up`.

Resolve is not available here because the durable outcome has not yet been confirmed.

Exit: result/response is known.

### Step 5 — Confirm outcome

Show only:
- chosen route;
- known result;
- outcome note;
- `Yes — resolve case`;
- `Not yet — continue follow-up`;
- `Need a different route`;
- `Close without resolution`.

This is the only active phase where Resolve is shown.

Exit: case becomes Resolved or returns to an earlier follow-up state.

## Visibility contract

In Interview follow-up:
- the guided current-step card is first;
- legacy `routePreview` and `caseLifecycle` controls are hidden as raw implementation detail;
- interview answers, research prompt, family info and history are secondary drill-down information only;
- no free-text plan-name field appears;
- no future-step button is visible before its entry condition is met.

The current step is derived from persisted backend state. It is not kept as an independent local status.

## Backend mapping

| Guided step | Persisted state |
|---|---|
| Review route | no active plan, or plan `research` |
| Agree route | plan `options_ready` |
| Take action | plan `action_in_progress` |
| Record result | plan `awaiting_outcome` |
| Confirm outcome | plan `persistence_check` |
| Resolved | plan `resolved` or `closed_unresolved`, lead `resolved` |

Route review remains in `family_match_runs`. Plans remain in `family_case_plans`. Transition evidence remains in `family_case_events`.

## Transition evidence

- route chosen -> match review `confirmed_match`, plan persisted;
- family proceeds -> `options_presented`, plan `action_in_progress`;
- concrete action completed -> `official_action_started`, plan `awaiting_outcome`;
- result received -> `official_response_received`, plan `persistence_check`;
- durable result confirmed -> `case_resolved`, plan/lead resolved;
- result not durable -> continue follow-up;
- route changed -> return to route review while preserving history;
- closed without result -> `case_closed_unresolved`.

## Acceptance criteria

1. Opening an Interview follow-up case shows the current decision within the first viewport.
2. Selecting `Use this route` never asks the operator to name a plan.
3. After every primary action the same workspace advances to the next step.
4. At most one primary forward action is visually dominant at a time.
5. Resolve is visible only after a recorded result exists.
6. A still-waiting case can save a follow-up time without changing to a fake completed state.
7. Going back to choose another route preserves earlier lifecycle history.
8. Resolved cases leave the active follow-up queue after refresh and keep their outcome history.
9. Interview/family/history detail is available but never competes with the current step.
10. The UI derives its step from Supabase-backed lifecycle data, not a duplicated browser-only status.
