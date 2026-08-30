const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

// Regression tests for docs/decisions/0003-canonical-family-journey-lifecycle.md
// §5 "Fixed this session" — each test pins the specific mechanism that fixed
// a confirmed, root-caused defect, so a later refactor can't silently
// reintroduce it without a test failure explaining what broke and why.

test('bindExtras marks branch-critical choice rows as wired so the generic enhancer cannot overwrite their handler', () => {
  const interview = read('tracker/interview-match.js');
  // interview-form-enhancements.js's wireChoiceRow() only overwrites a row's
  // onclick when row.dataset.wired !== '1'. bindExtras() must set that flag
  // after wiring its own applyWorkContext()-calling handler, or the branch
  // questions (Studying/Working/etc.) silently stop revealing their
  // dependent fields the moment the enhancer's MutationObserver fires.
  assert.match(interview, /function bindExtras\(\)\{document\.querySelectorAll\('#questions \.match-extra \.choice-row'\)\.forEach\(r=>\{/);
  assert.match(interview, /r\.dataset\.wired='1'/);
});

test("human-labels.js never runs a document-wide substring replace with a short, generic code", () => {
  const labels = read('tracker/human-labels.js');
  // The CODES map (short codes like 'start'/'new') must only ever be read
  // via cleanElement()'s exact-match lookups, never fed into the
  // TreeWalker's substring pass — that's what turned "Not started" into
  // "Not Starteded" and "knew it" into "kNew it" (short keys matching
  // inside unrelated words anywhere on the page).
  assert.match(labels, /const CODES=new Map/);
  assert.match(labels, /const PHRASES=new Map/);
  assert.match(labels, /PHRASES\.forEach\(\(next,old\)=>\{if\(out\.includes\(old\)\)out=out\.split\(old\)\.join\(next\)\}\)/);
  assert.doesNotMatch(labels, /TEXT\.forEach\(\(next,old\)=>\{if\(out\.includes\(old\)\)/);
});

test('the Next Steps panel reads the real plan_status column and refreshes after an actual interview save', () => {
  const nextSteps = read('tracker/interview-next-steps.js');
  const interview = read('tracker/interview-match.js');
  // family_case_plans has no `status` column, only `plan_status` (matches
  // case-lifecycle.js's own activePlan() definition) - reading `.status`
  // meant activePlan always resolved to the first plan regardless of state.
  assert.doesNotMatch(nextSteps, /p\.status!==/);
  assert.match(nextSteps, /p\.plan_status!=='resolved'&&p\.plan_status!=='closed_unresolved'/);
  assert.match(nextSteps, /activePlan\?\.plan_status==='awaiting_outcome'/);
  // A successful route-specific save must announce the saved record. The
  // Next Steps module listens to that success signal instead of wrapping the
  // inert global fallback or guessing which onclick reference is active.
  assert.match(interview, /AqoonInterview\?\.announceSaved\?\./);
  assert.match(nextSteps, /addEventListener\('aqoon:interview-saved'/);
});

test('the public intake request id survives a closed tab, bounded by a TTL so an old case is never silently reused', () => {
  const app = read('caawi/app.js');
  // sessionStorage clears on tab close, orphaning the partial intake row
  // and creating a duplicate lead when an operator later finished it.
  // localStorage must be used instead - but never unboundedly, or a family
  // returning long after their case resolved would have a new need merged
  // into the old closed lead.
  assert.doesNotMatch(app, /sessionStorage.*aqoon_intake_request/);
  assert.match(app, /function getRequestId\(\)/);
  assert.match(app, /function setRequestId\(rid\)/);
  assert.match(app, /INTAKE_REQUEST_TTL_MS/);
  assert.match(app, /set\('aqoon_intake_request',rid\+'\|'\+Date\.now\(\),local\)/);
  assert.match(app, /local\.removeItem\('aqoon_intake_request'\)/);
});

test('resolving a case plan atomically resolves the CRM lead in the same request', () => {
  const lifecycle = read('supabase/functions/family-case-lifecycle-admin/index.ts');
  // save_plan already moved a lead back to 'contacted' when a *new* plan
  // was created after a prior resolution (reopening). The reverse case -
  // an existing plan reaching a terminal plan_status - must move the lead
  // to 'resolved' in the same call, or the family is stranded showing an
  // active-looking CRM card with a closed plan and no visible sign it's done.
  assert.match(lifecycle, /planStatus === "resolved" \|\| planStatus === "closed_unresolved"/);
  assert.match(lifecycle, /status: "resolved", journey_stage: "resolved", resolved_at: new Date\(\)\.toISOString\(\)/);
});

test('a password-only tracker session sees "Assign to me" disabled with an explanation, not a dead-end alert after clicking', () => {
  const nav = read('tracker/crm-queue-navigation.js');
  // A password-only session (no signed-in operator id) can click "Assign to
  // me" and get an alert telling it the assignment can never succeed. That
  // dead end should be visible before the click, not after it - a disabled
  // button with an explanatory title, gated on the same operator id every
  // assignment path already requires.
  assert.match(nav, /assignToMeButtonHtml\(leadId, className\) \{/);
  assert.match(nav, /if \(sessionStorage\.getItem\('aqoon_operator_id'\)\) \{/);
  assert.match(nav, /disabled title="Sign in with your operator account/);
  // All three assign-to-me render sites (incomplete intake, first contact,
  // in-progress) must route through the shared helper instead of an
  // always-active button, or the fix only covers some queues.
  const helperCalls = nav.match(/this\.assignToMeButtonHtml\(leadId, '(primary|secondary)'\)/g) || [];
  assert.equal(helperCalls.length, 3);
});
