# Tracker deep audit — CRM, interview, analytics, sales — 2026-08-29

Scope: requested directly by Abducadir after the queue-based CRM redesign, asking for a full map of every tracker file/field/table, whether everything connects correctly, what's dead code, whether interview questions are optimized against prior design decisions, whether Analytics shows what it should, and whether Sales connects to family-need data toward a "sell verified demand to buyers" business model. Three parallel deep-reads were run (Supabase schema, interview architecture, analytics+sales code) and cross-checked. This doc is the synthesis; nothing below is guessed — every claim traces to a file:line or a table/column read directly.

## 0. Business-model correction — read this before anything else

`docs/architecture/business-operating-model.md:44` (canonical, Finnish):

> "Ostajalle ei myydä perheiden raakaa yhteystietokantaa. Ostettavia asioita ovat sovitut lopputulokset, toteutettu polku, materiaalit, koulutus ja anonymisoitu koonti siitä, missä polku toimii tai katkeaa."
> ("Buyers are not sold a raw family contact database. What is sellable is: agreed outcomes, the executed journey, materials, training, and an **anonymized aggregate** of where the journey works or breaks.")

The framing in the request — "sell leads," "provide leads to send to different places" — needs to be translated, not implemented literally. What the model actually supports, and what would satisfy both the business goal and this boundary, is an **aggregate count**: "we have 40 verified families with a daycare need in Vantaa this month, N already past first interview" — never a row-level contact export. Every recommendation below that touches sales/demand-matching is written against that boundary. This is the same boundary CLAUDE.md states: "AQOON does not sell family contact lists."

## 1. Confirmed: Sales pipeline and family intake are two disconnected systems

`sales_opportunities` (3 rows: Pilke päiväkodit, Norlandia Päiväkodit, Vantaan kaupunki–Harrastusten Vantaa) has **no column, anywhere, linking it to `family_leads`, `main_need`/`sub_need`, or any need taxonomy**. Confirmed both directions:

- Schema: `sales_opportunities` columns are `organization, contact_name, contact_role, stage, health, summary, goal, success_definition, completed_steps, next_steps, next_action, next_action_at, probability, source, owner_operator_id` — no family-side field at all.
- Code: `tracker/operations-system.js` and `supabase/functions/ops-admin/index.ts` never read `main_need`/`city`/any taxonomy from `family_leads`. The **only** place `family_leads` data reaches the sales/ops surface is `ops-admin/index.ts:61`, which pulls individual `name/phone/city/main_need` rows with a due follow-up into the shared calendar/agenda list — that's personal call-list scheduling, not demand intelligence, and it has zero relationship to any `sales_opportunities` row.
- `partner_programs` (33 rows) has `category`/`audience`/`pain_match` columns that *look* like they should connect to family needs — but there is no foreign key or join path from it to `family_leads` or `sales_opportunities` anywhere.

**This means today the system genuinely cannot answer "how many unmatched daycare-need families do we have in Vantaa" as a query — that logic doesn't exist.** The building block for it already exists though: `family-leads-admin`'s `analytics` action already computes `needs`/`cities` count breakdowns server-side for the Analytics tab (proving the counting logic is cheap) — it's just never parameterized by need+city+stage or exposed to the Sales tab. See Phase 2 below.

Two related schema-hygiene findings from the same pass:
- `family_contact_starts` (0 rows) looks like a near-duplicate of `family_intake_contacts` (37 rows, actively used) — same shape, same purpose, one apparently superseded and never wired to the live form. Needs a one-line confirmation of which the current form actually posts to, then retire the other.
- `family_call_log` (0 rows) exists as a proper audit-trail table but calls are only ever written to denormalized `family_leads.last_call_outcome`/`last_call_at` — the history table is built and unused.

## 2. Dead code inventory — three separate clusters, same root bug

Every cluster below fails for the identical reason: a file was written expecting `app.js` to expose `window.leads`, `window.partials`, `window.renderCRM`, `window.openInterview`, or `window.saveInterview` globally. **`app.js` wraps everything in an IIFE and never assigns any of these to `window`** (only `window.AqoonInterview` and, as of this session's own fix, `window.AqoonApp.leads`/`.partials` are real). Every file below checks `typeof orig === 'function'` before patching, so each one silently no-ops at load time — no console error, no visible symptom, just a feature that has never once fired.

### Cluster A — "operator scope / phase navigation" (predates the queue redesign, now also superseded by it)
`tracker/crm-phase-navigation.js`, `crm-lifecycle-data.js`, `crm-lifecycle-timeline.js`, `crm-context-panel.js`, `operator-analytics.js`, `operator-dashboard.js`, `operator-crm-filters.js` — 7 files, all loaded on every page view.

- All patch `window.renderCRM` (undefined) → dead, confirmed by grep (no assignment to `window.renderCRM` exists anywhere).
- `crm-phase-navigation.js` additionally targets `#familyQueues`, an element ID that no longer exists since last session's queue redesign (`index.html` now has `#crmQueuesGrid`/`#familyPanel`) — dead twice over.
- `operator-analytics.js` is the one partial exception: it also has a `MutationObserver` on `#analytics`'s class attribute that *does* fire on every real tab switch — but what it does when triggered is also inert, for two more reasons: it tries to tag `.jrow` elements with `data-lead-id` that `app.js` never sets (deliberately — anonymous session rows must stay separate from CRM identity), and it reads a scope variable (`window.operatorScope` / `sessionStorage['crmOperatorScope']`) that the one file that ever *sets* a scope (`operator-crm-filters.js`) writes under a **third, different name** (`window.crmOperatorScope`). Three files, three incompatible names for the same concept, none talking to each other.
- Net effect: the entire "assigned to me / unassigned / all" operator-scope filtering feature has never once actually filtered real data, in any of its three independent implementations.
- **This is now moot anyway**: the new queue-based CRM (`crm-queue-navigation.js`, shipped this session) already implements the two operator-assignment points the business actually needs (assign-to-me at incomplete-intake and at interview-start) in a way that works. This whole cluster should be deleted, not repaired — keeping it around risks a future "why isn't operator scope working" investigation into code that was never live.

### Cluster B — interview-drawer "smart" add-ons (built, loaded, never once executed)
`tracker/interview-context.js`, `interview-follow-up-recap.js`, `interview-next-steps.js`.

- `interview-context.js` patches `window.openInterview` (undefined — `app.js`'s `openInterview` is closure-local) → the "Interview context panel" (prior summary + research-brief recap shown when reopening a family) has never rendered in production.
- `interview-follow-up-recap.js` patches `window.AqoonInterviewContext.attach`, which only exists inside (A)'s dead code — cascading dead.
- `interview-next-steps.js` patches `window.saveInterview` (also undefined, same reason) → "Next steps suggested" panel after save has never rendered.
- This is the highest-value dead cluster to *fix rather than delete*: a "what changed since the first interview" recap is exactly the two-operator handoff tool the tracker/CONTEXT.md target calls for (Abducadir/Mustafe covering each other's cases). Fixing it is a small change — expose `openInterview`/`saveInterview`/`currentAnswers` properly from `app.js` — not a rebuild.

### Cluster C — smaller, contained dead code in `app.js` itself
- `Q`, `qHtml()`, `bindQ()` (app.js) — decision doc 0002 §7 already documents these as deliberately kept as an inert fallback if `interview-match.js` fails to load. Leave as-is; this one is intentional, not a bug.
- `saveInterview()`/its `onclick` binding in `app.js` — technically runs once at page load, but is unreachable in normal use because `interview-match.js` overwrites the button's handler the instant any interview is opened. Same fallback category as above — leave.
- `answerLines()` and `activeQuestions` (app.js) — genuinely dead, no remaining call sites, not part of the documented fallback. Safe to remove.
- `universal-proof-questions.js`'s `WEEKLY` rotating-question object — `enabled:false` hardcoded, no config path anywhere to ever turn it on. Either wire it to something or remove it; currently pure dead weight.

## 3. Interview question architecture — mostly deliberate, one real gap, one duplication no one's using

The three/four-layer design (`interview-match.js` route-specific, `interview-form-enhancements.js` deeper pilot layer, `universal-proof-questions.js` universal baseline, plus a previously-undocumented fourth source: `interview-match-preview.js`'s server-driven `match_preview` question injection) is deliberate, matches the canonical spec (`workspaces/evidence-and-research/references/interview-instrument-design-2026-08-27.md`), and decision doc 0002 is an honest account of what's been consolidated.

Two things worth a decision, not a silent fix:

1. **Length has drifted past its own target.** The spec's target was "1–3 minutes" for the universal+conditional layer. Decision doc 0002 §2 already measured a daycare case at **32–42 fields** across all active layers combined — well past that target, even though today's production default (`PILOT_DEPTH_MODULE_ENABLED=false`) keeps most of layer 2 off. If that pilot flag is ever turned on for real use, length becomes a real problem immediately.
2. **One un-aliased overlap, confirmed present in code, currently harmless only because the pilot flag is off**: `interview-form-enhancements.js`'s `hobby_registration_help` vs. `universal-proof-questions.js`'s `vantaa_hobbies_possible_need`/`vantaa_hobbies_reminder` — near-duplicate questions with no alias mapping between them. Decision doc 0002 already names this; it's still unresolved. Needs fixing *before* the pilot flag is ever flipped on, not after.

Separately, confirmed directly from code (not previously documented anywhere): **the "deep-research brief" step is entirely manual.** Clicking save generates a text prompt, POSTs it to be stored, and displays it with a "Copy complete research brief" button — the operator has to paste it into an external AI tool themselves and paste the answer back in. No AI/search API call exists anywhere in this path. The scenario-learning auto-match (`family_scenarios`) is correctly wired to try a stored match first and otherwise append a machine-readable contract for that manual paste-back — it's a real, working loop, just one that depends on an operator behavior (completing the round-trip) that per the prior audit hasn't happened yet in production (0 rows in `family_scenarios`).

## 4. Analytics tab — real data already computed and thrown away, one visible duplicate wasting cycles

Confirmed by diffing the Edge Function's actual `analytics` response against every field the UI reads:

- **`devices`** (mobile/desktop session split) — computed every load, never shown anywhere.
- **`traffic_trend`** — a proper period-aware (7d/30d/90d) time-series, computed every load, never shown. What *is* shown instead (`newLeadSpark`) is a client-side reimplementation fixed at 7 days regardless of which period is selected at the top of the tab — the period switch silently doesn't affect this chart.
- **`flow_dropoffs`** — a more precise server-computed funnel-leak breakdown (includes a stage the client version doesn't track at all), thrown away in favor of a client-side `biggestLeak()` reimplementation that can diverge from it.
- **`new_lead_records_in_range`** — computed, unused.

Also confirmed: two separate files each build a full "interview insights" aggregate card for the Analytics tab (`universal-proof-questions.js` and `analytics-mobile-v2.js`). A third file (`analytics-mobile-v2.css`) force-hides the first one. So `universal-proof-questions.js` fetches and computes a real aggregate on every single tab open, for a card that is permanently invisible — wasted work, not a visible bug, but should be removed once confirmed the visible card fully supersedes it.

**On the specific complaint about the daily-volume chart**: confirmed, with numbers. The KPI numbers above it render as bold 23px figures in their own card; the "Sessions by hour" chart below them is a ~126px-tall strip with 18px-wide bars and 7 of every 8 hour labels deliberately hidden via CSS, positioned as the 5th card down the tab — after the KPIs, a notice banner, the health card, and the funnel card. It also only ever shows the last 24 hours regardless of the period switch, while the genuinely period-aware version (`traffic_trend`, above) sits unused. This is a legitimate, precisely-locatable design gap, not a vague impression.

One good finding worth keeping visible: `analytics-mobile-v2.js`'s card is currently the **only** place in the entire tracker where consent (`relevant_updates_ok`/`outcome_followup_ok`) reaches a screen at all — as an aggregate percentage, not per-family (per-family consent display still doesn't exist anywhere, confirmed — the values are fetched in `operator-identity.js` and then never read again).

## 5. Prioritized plan

**Phase 0 — decisions needed from Abducadir/Mustafe before touching code:**
- Confirm the business-model correction in §0 (aggregate demand counts for buyers, never raw contact export) as the actual target for any "sales ↔ family data" work.
- Greenlight deleting Cluster A (operator-scope files) outright vs. salvaging the "assigned to me" scope filter into the new queue UI specifically.
- Confirm `family_contact_starts` vs `family_intake_contacts` — which does the live form actually write to.
- Decide whether the interview length/duplication issue (§3) gets fixed now or stays deferred (it's currently harmless because the pilot flag is off).

**Phase 1 — safe, no-decision-needed cleanup (ready to execute now):**
- Delete Cluster A (7 files + their `<script>` tags) — fully superseded by the working queue UI, zero functional loss.
- Fix Cluster B (3 files) by properly exposing `openInterview`/`saveInterview`/`currentAnswers` from `app.js` — turns three already-loaded, already-written features on for the first time, no new code needed beyond the missing `window.` assignments.
- Remove the dead `universal-proof-questions.js` insights card (keep the visible `analytics-mobile-v2.js` one) — stops wasted computation on every Analytics tab open.
- Wire the four already-computed-but-discarded analytics fields (`devices`, `traffic_trend`, `flow_dropoffs`, `new_lead_records_in_range`) into the UI, and make `traffic_trend` (period-aware) replace the fixed-24h chart, resized/repositioned near the KPI numbers per the original complaint.
- Remove genuinely dead `app.js` code (`answerLines`, `activeQuestions`) — leave the documented-intentional fallback (`Q`/`qHtml`/`bindQ`/`saveInterview`) alone.

**Phase 2 — new capability, needs backend query work (this is the actual "sell verified demand" foundation):**
- Extend `family-leads-admin`'s existing `needs`/`cities` counting pattern into a parameterized aggregate query (need × city × journey-stage), surfaced either inside relevant `sales_opportunities` records or as a standalone aggregate view — built as counts only, never row export, per §0.
- Wire `family_call_log` to actually receive rows instead of only the denormalized fields.
- Resolve the `family_contact_starts`/`family_intake_contacts` duplication once Phase 0 confirms which is live.
- Execute the interview-length consolidation from §3 if Phase 0 greenlights it.

I'm ready to start on Phase 1 now — it's all reversible, well-scoped, and doesn't require a product decision. Say the word and I'll go file by file with the same care as this session's earlier integration fixes.
