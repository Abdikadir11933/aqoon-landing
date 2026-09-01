# AQOON one-system audit and rebuild plan

Status: active execution contract, 1 September 2026.

This plan replaces component-by-component confidence with one end-to-end
proof standard. AQOON is not complete when an intake, interview, database
write, route card, follow-up screen or chart works by itself. It is complete
only when the same fact and action survive the whole operating chain and
produce the correct operator decision, family action, outcome and aggregate
learning.

## 1. Outcome and non-negotiable rules

The canonical chain is:

`help request -> household/person -> stated need -> short scenario interview -> decisive facts -> verified options -> operator decision -> family agreement -> assisted action -> partner handoff when consented -> verified outcome -> persistence -> anonymised learning`

Every production field, question, button, table, event and chart must have:

1. one documented purpose;
2. one canonical owner;
3. a defined writer;
4. a defined reader or consumer;
5. a defined correction path;
6. an explicit privacy and consent boundary;
7. an automated contract test;
8. an end-to-end acceptance test when it affects the operator or family;
9. a removal decision if it has no consumer.

No future pass may claim “everything works,” “the loop is complete,” or an
equivalent statement. Allowed completion language is bounded and evidenced,
for example: “the Vantaa daycare vertical slice passed the listed database,
browser and analytics assertions on deployment X.” Unknown and untested paths
remain explicitly unverified.

Assignment is not treated as a product defect in this programme. Two operators
may assign work manually; the audit still verifies that assignment cannot
corrupt another state.

## 2. Why the previous approach kept failing

The system accumulated multiple independently correct-looking layers:

- intake need labels;
- interview topic labels;
- answer JSON keys;
- verified-route `need_domain` values;
- case-plan states;
- lead journey stages;
- future-opportunity domains;
- Sales demand text;
- Analytics labels and denominators.

Changes were usually verified inside one layer. They were not required to
prove all downstream consumers. This allowed a question to save correctly but
remain invisible to matching, a future hint to exist in Supabase but not in the
operator workflow, or a Sales record to describe the same demand using text
that can never equal the family need text.

The correction is not another isolated patch. It is a generated lineage
contract plus vertical-slice release gates.

## 3. One repeatable execution loop

Every bounded vertical slice uses the same loop:

1. **Observe** — reproduce the real operator/family flow and capture the exact
   deployed commit, Edge Function versions, requests, responses and database
   before-state.
2. **Trace** — follow every input and click through UI handler, API action,
   validation, table/RPC/trigger, response, local state, next screen, event,
   chart, Sales aggregate and learning queue.
3. **Contract** — update the canonical lineage matrix before changing code.
   State the expected writer, reader, value vocabulary, null behaviour,
   correction behaviour, consent and denominator.
4. **Implement** — fix the smallest root cause across all affected consumers.
   Remove or consolidate competing handlers rather than stacking another
   patch when ownership is ambiguous.
5. **Migrate** — reconcile historical production data when the contract
   changes. A code fix that leaves current operator records misleading is not
   complete.
6. **Verify locally** — syntax, unit, contract, migration, privacy, usability,
   mobile and deterministic synthetic-flow tests.
7. **Verify live** — exact deployed commit, fresh authenticated browser,
   network/log inspection, database assertions and visible operator result.
8. **Re-run dependent slices** — a change to shared identity, state, questions,
   auth or caching re-runs every dependent slice, not only its new test.
9. **Record evidence** — pass/fail, deployment, database checks, screenshots,
   timings and unresolved gaps. Only the bounded slice may be marked complete.

## 4. Canonical inventories to build first

### 4.1 Runtime inventory

Inventory every production HTML, CSS, JavaScript and module in load order.
For every script record:

- global it defines or wraps;
- DOM it owns;
- event listeners and fetch wrappers it installs;
- API actions it calls;
- shared state it reads or mutates;
- scripts loaded before and after it;
- whether it is active, fallback, feature-flagged, superseded or dead;
- overlapping handlers that can race or rewrite the same payload.

This explicitly includes the current interview stack, where several scripts
create fields, replace choices, wrap `window.openInterview`, patch `fetch`,
restore drafts and alter the saved interview type.

### 4.2 Supabase inventory

For every Tracker-related table, view, function, trigger, policy and Edge
Function action record:

- complete columns and types;
- primary, unique and foreign keys;
- checks and permitted vocabularies;
- RLS enabled state and policies;
- role grants and `SECURITY DEFINER` boundaries;
- every code reader and writer;
- trigger side effects;
- retention/deletion behaviour;
- whether live schema, migrations and repository code agree;
- orphaned, duplicated or unused structures.

### 4.3 Field-and-action lineage matrix

Generate, do not hand-maintain, one row for every field and operator action:

| Contract field | Required information |
|---|---|
| Canonical key | Stable semantic identifier and schema version |
| Purpose | Decision, operation, evidence, Sales, future hint or consent |
| Applies when | Exact scenario and branch predicate |
| Asked to | Family, operator observation, imported intake or system-derived |
| UI source | Page, question, input/button and handler |
| Validation | Client and server rules, including meaningful values |
| Storage | Table/column or JSON key and event |
| Matching consumer | Route/domain/criterion and value rule |
| Follow-up consumer | Where the operator sees and edits it |
| Analytics consumer | Metric, denominator, date and dedupe unit |
| Sales consumer | Demand taxonomy/stage or explicitly none |
| Learning consumer | Scenario/feedback workflow or explicitly none |
| Consent/privacy | Purpose limitation and PII class |
| Correction | Edit, revision, invalidation and recomputation behaviour |
| Tests | Contract and end-to-end test IDs |

Any row with a missing owner, consumer, correction path or test blocks release.

## 5. Canonical operational data model

The audit must decide and implement one identity hierarchy:

- **household** — relationship container and shared contact context;
- **person** — adult or child, with minimal necessary personal facts;
- **need/case** — one current problem or goal, with primary/secondary/future
  classification;
- **interview** — versioned observation of a scenario, never the identity;
- **route review** — evidence-backed possible/confirmed/rejected option;
- **plan** — the route and concrete action agreed with the family;
- **action/handoff** — what AQOON or a consented partner actually did;
- **outcome/persistence** — verified result and later status;
- **future opportunity** — a hint or confirmed later need, not a duplicate lead;
- **Sales opportunity** — organisation-level relationship, connected only to
  anonymised demand and consented outcomes.

Phone/name similarity creates a duplicate-review candidate, not an automatic
merge. Shared family phones and two people using one device are valid cases.
Merges must preserve original intake records and audit history.

Need states must distinguish:

- `primary_now` — why the person contacted AQOON;
- `secondary_now` — another issue they explicitly want help with now;
- `future_hint` — a relevant life-stage signal, not yet offered;
- `confirmed_future_interest` — family wants later contact and permission is
  recorded;
- `not_relevant` / `declined` — do not continue asking or selling;
- `resolved` — outcome recorded without deleting history.

## 6. Interview redesign contract

The interview must be short because it is an operational diagnosis, not a
questionnaire catalogue.

### 6.1 Four layers only

1. **Scenario gate** — identify who this is about and the current situation.
2. **Primary decisive criteria** — only facts that change the route for the
   stated need.
3. **Operator context** — free text or dictation for nuance; always visible in
   the decision brief and research context, but never silently treated as a
   verified criterion.
4. **Optional relationship signals** — a small, non-leading close. The
   operator records observed hints separately from questions actually asked.

### 6.2 Question admission rule

A structured question remains only if at least one current consumer exists:

- it chooses the scenario;
- it confirms/excludes a route;
- it supplies a required application/action fact;
- it is a defined evidence metric with a valid denominator;
- it creates a permissioned future follow-up;
- it is required for safety, consent or commercial disclosure.

Otherwise it becomes optional operator notes or is removed.

Every question must also support `Not applicable` when the branch can
legitimately exclude it. Hidden answers are cleared and the server independently
rejects impossible or incomplete completed interviews.

### 6.3 Scenario packs required for the first release gate

- one specific job/pilot/shift only;
- student seeking part-time or occasional work;
- unemployed person seeking work;
- work plus first qualification/oppisopimus/training;
- education-first/new qualification;
- daycare now;
- daycare needed only if work/study starts;
- school support;
- child hobby/activity, separately for Helsinki and Vantaa;
- mixed/uncertain case;
- primary need only, no other help wanted.

Each scenario receives a maximum question budget and a written reason for every
question. Household children are represented as repeatable child records or
age-stage counts, never a fixed “two children” assumption.

### 6.4 Relationship and evidence close

The closing section separates:

- what the family explicitly said they want now;
- what they may want later;
- what the operator merely noticed;
- whether AQOON may contact them about a specific relevant opportunity;
- whether outcome follow-up is allowed;
- the operator's assessment of navigation barriers;
- the family's direct answer about usefulness, only if actually asked.

Operator opinions and family answers must never be aggregated under the same
field.

## 7. Matching and research contract

One server-side scenario calculation must drive:

- required interview fields;
- route domains;
- research-prompt routes;
- verified-route preview;
- missing and conflicting facts;
- follow-up decision brief;
- scenario fingerprint.

The browser must not mutate `interview_type` after generating the research
prompt. Presence of an answer is not evidence that its value fits. `No`, `Not
sure` and `Not applicable` receive explicit rule semantics.

Each verified route must have:

- controlled need/domain taxonomy;
- current official sources and recheck date;
- municipality/scope rules;
- required facts with value-level rules;
- human/authority/provider decision boundary;
- explicit exclusion reasons;
- first concrete action;
- route-specific regression personas.

Route coverage and question coverage are released together. A route cannot be
added without its interview facts; a required interview question cannot be
added without a route or another documented consumer.

## 8. Post-interview workflow contract

Saving a completed interview must atomically produce or update:

- versioned interview and revision history;
- lead/case stage;
- one concrete operator next action;
- next follow-up time when applicable;
- consent state;
- scenario result;
- route preview inputs;
- future signals with correct status/timing;
- one timeline event;
- local UI state without a full manual refresh.

The operator flow is:

1. review situation, goal, decisive facts and notes;
2. inspect route cards with sources, missing facts and exclusions;
3. mark `fits`, `possible—research/confirm`, or `does not fit` with reason;
4. for uncertain routes, paste/save research and verify sources;
5. make the final operator choice;
6. call the family and record what was agreed;
7. perform/log the concrete action;
8. record provider/authority response;
9. resolve or keep pending with a dated next step;
10. verify persistence where the outcome requires it.

Future hints remain visible but secondary; they must never overwhelm a person
who wants help with one clear need only.

## 9. Analytics, Sales and learning contracts

### 9.1 Operational analytics

Must reconcile directly to canonical records/events:

- intake -> interview -> route decision -> plan -> action -> outcome ->
  persistence;
- workload and overdue actions;
- unresolved reasons and cycle time;
- denominator, date range and dedupe unit on every metric.

“Lead journey” and “active case plans” are separate metrics and cannot share a
misleading label.

### 9.2 Evidence analytics

Family answers, operator observations and system events are separate sources.
Conditional questions use conditional denominators. Schema version is mandatory.
Household-level questions deduplicate by household; child-level questions use
the correct child or child-stage unit.

### 9.3 Sales demand

Replace exact free-text equality with controlled demand dimensions such as:

- need domain and route;
- city/area scope;
- age/stage and timing;
- confirmed family interest;
- route fit/qualification status;
- offer, consented handoff, application, start and persistence state.

Sales sees anonymised counts. A named family reaches a partner only through a
separate, explicit partner-handoff consent and disclosure step.

### 9.4 Learning

Learning is a human-reviewed queue:

1. store the operator's structured rejection or correction;
2. group repeated PII-free signals by route/criterion/scenario;
3. show a review queue with evidence and affected cases;
4. verify official sources when rules may have changed;
5. approve, dismiss or apply;
6. version the resulting knowledge;
7. re-run affected regression personas;
8. record reuse and eventual outcomes.

Pending signals and orphan scenario drafts are operational debt, not learning.

## 10. Regression harness

The test suite must move beyond source-string assertions.

### 10.1 Contract tests

- every UI answer key exists in the lineage registry;
- every server-required route input resolves to a valid field;
- every field value has defined rule semantics;
- every Analytics metric declares source, denominator and dedupe unit;
- every Sales dimension maps through controlled taxonomy;
- every state transition is legal and atomic;
- all Edge Function actions have caller, request and response schemas;
- migrations, live schema and generated types agree;
- no production script has overlapping ownership without an explicit adapter.

### 10.2 Synthetic personas

Maintain non-PII personas for every scenario plus boundary combinations:

- no children;
- one, two and more than two children;
- same household with multiple present and future needs;
- shared phone but different people;
- one clear need and no cross-sell interest;
- student plus part-time work;
- unemployed plus first qualification;
- contradictory schedule/childcare answers;
- Helsinki/Vantaa/Espoo municipality boundaries;
- unknown, not applicable and explicit refusal;
- corrected interview and reopened case.

### 10.3 Browser and database assertions

For every persona, verify:

- exact questions shown and hidden;
- save-block and server rejection for missing decisive facts;
- stored values, schema version, notes, consent and events;
- route candidates, exclusions and missing facts;
- prompt routes equal stored scenario routes;
- immediate follow-up navigation and no refresh requirement;
- plan progression and recovery after reload;
- future hints and their timing;
- Analytics deltas and denominators;
- Sales aggregate deltas without PII;
- learning signal and review behaviour;
- deletion/correction/reopen behaviour.

### 10.4 Failure and performance tests

- expired/missing/rotated auth tokens and concurrent requests;
- slow, failed and duplicated requests;
- double-click and idempotency;
- stale cache and two-tab updates;
- old frontend against new backend and vice versa;
- mobile 390px and desktop 1280px;
- long notes and multiple children;
- recovery without duplicate interviews, plans, events or opportunities;
- measured interaction and refresh budgets.

## 11. Release strategy

Release bounded vertical slices in dependency order:

1. canonical registry and runtime ownership;
2. household/person/need identity and duplicate review;
3. interview save contract and server validation;
4. one-clear-need work slice;
5. work-plus-education slice;
6. daycare and future-daycare slice;
7. Helsinki/Vantaa hobby and school slice;
8. follow-up plan/action/outcome slice;
9. Analytics reconciliation;
10. Sales demand and partner outcome slice;
11. learning review/reuse slice;
12. full-system regression.

Each slice requires a migration/backfill plan, local evidence, exact master
commit, READY deployment, live browser proof and production database
reconciliation. If any dependent slice fails, the release remains partial.

## 12. Baseline defects from the first live-interview forensic pass

The following verified defects seed the first execution backlog:

1. one household can be fragmented into multiple leads and double-counted;
2. current interview save omits the displayed next action;
3. completed interviews are saved without schema version;
4. server accepts incomplete “completed” interviews;
5. stored mixed interview type can disagree with research-prompt routes;
6. older lead notes are omitted from research context;
7. benefit questions can appear without an explicit benefit need;
8. schedule, childcare and work-intent contradictions are not reconciled;
9. verified-route coverage is too narrow for current live scenarios;
10. some route matching treats answer presence as fit;
11. later/maybe future needs are flattened to ready-now opportunities;
12. future opportunities are hidden from the primary follow-up workflow;
13. Analytics “Family journey” counts plans while operators read it as lead
    journey;
14. expired auth can leave cached cards visible beside failed live cards;
15. Sales exact free-text matching produces zero demand matches;
16. private-daycare willingness is stored indirectly but not counted by Sales
    or the active evidence analytics;
17. scenario and route-feedback queues have no complete operational review
    loop;
18. repeated scenario saves can leave orphan drafts and pending research;
19. the existing tests pass while these live semantic failures remain.

These are starting evidence, not the claimed complete bug list.

## 13. Final system acceptance gate

The complete system may be called release-ready only when:

- inventory and lineage contain no unexplained production element;
- every canonical field has writer, consumer, correction and test;
- every scenario persona passes intake through persistence;
- live tables reconcile to UI counts and Analytics denominators;
- Sales demand reconciles to consented, household-deduplicated operational
  facts;
- notes and structured answers appear in the correct decision/research views;
- route feedback reaches a review queue and approved changes are versioned;
- auth expiry, retry, caching and reload tests pass;
- all repository QA and security advisors pass;
- the exact master commit is live and verified;
- remaining unknowns are listed as unverified rather than silently treated as
  working.

## 14. Execution ledger

This ledger records completed gates without converting partial evidence into a
system-wide completion claim.

### 2026-09-01 — Gate 1 runtime and live-data baseline complete

- generated and CI-locked the exact 27-script Tracker runtime order;
- inventoried the browser API actions, eight called Edge Functions, all Edge
  Function database calls/RPCs and 147+ answer-key references;
- reconciled all directly queried Tracker tables with the live Supabase schema;
- recorded active embedded matching dependencies on `knowledge_criteria` and
  `knowledge_services`;
- verified RLS is enabled on the active tables and documented the intentional
  Edge-Function-only access model;
- classified the 666 legacy knowledge chunks as discovery-only, not matching
  truth;
- captured the live security-advisor baseline and separated safe Tracker work
  from shared-project changes that require caller verification.

Evidence: `docs/architecture/generated-tracker-contract-inventory.json` and
`docs/architecture/tracker-runtime-data-ownership-2026-09-01.md`.

Next gate: assign a purpose, owner, writer, consumer, correction path, privacy
class and test to every active intake/interview/decision field before changing
the question set.

### 2026-09-01 — Gates 2–8 implemented and regression-locked

- assigned provenance, purpose, consumer, privacy and correction ownership to
  every released interview field;
- introduced canonical household/person/need identity and correction-safe
  interview coverage;
- shortened interviews into explicit scenario branches with hidden-answer
  clearing, `Not applicable` support and server-side completion validation;
- made route matching deterministic, evidence-gated and current-source-only;
- made route selection, research approval, lifecycle progression, reopening,
  partner handoff and outcomes atomic and retry-safe;
- connected future demand, Analytics, Sales and the human-reviewed learning
  queue without copying family PII into commercial aggregates;
- expanded CI from a small subset to the complete regression suite and added
  browser asset, endpoint/action, import and database-ownership graph checks.

Evidence: 189 local tests and both exact-commit GitHub workflows passed at
`28a7c1c47f1dc588fda222223d633d1145336c22`; the matching Vercel production
deployment was READY.

### 2026-09-01 — Gate 9 production schema reconciliation complete

- enumerated every active table, column and foreign key from production
  metadata without reading family rows;
- verified all 29 operational tables are RLS-enabled with zero browser table
  grants;
- recovered the missing pre-repository structural baseline for eight core
  tables, `operators` and the public-intake rate-limit RPC;
- removed the regression-suite legacy exception so every Edge table and RPC
  must now be owned by repository SQL;
- versioned three production-only diagnostic indexes and removed browser
  execution from the internal interview-completion trigger function;
- applied both reconciliation migrations and verified service-role-only RPC
  execution in production;
- confirmed all 13 repository Edge Functions exist and are ACTIVE with the
  expected public/private JWT split.

Evidence:
`docs/architecture/supabase-operational-schema-contract-2026-09-01.md`,
`supabase/migrations/20260826000000_recovered_operational_baseline.sql`, and
`supabase/migrations/20260901230000_live_schema_reconciliation.sql`.

Next gate: commit/push this reconciliation, require exact-commit CI and READY
production deployment, then run the final live release checks. Shared legacy
product grants and Auth leaked-password protection remain explicitly
unverified/configuration-owned; they are not silently treated as fixed.

### 2026-09-01 — Gate 10 release verification pending exact-commit close

The release query found six completed interviews created before versioned
answer keys. They are not being guessed into the current v5 contract. The
correction explicitly tags them `legacy-unversioned`, preserves the previous
rows through interview revision history and validates the table-wide version
constraint. The production Edge parity pass also found and corrected an older
route-domain selector in `family-route-preview-admin`; all 13 functions now
match repository source. The rollback-only lifecycle probe and all aggregate
integrity checks passed with zero residue. Exact-commit CI and READY deployment
remain the final closing evidence for this gate.
