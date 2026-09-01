const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('the Families queue "Open resolution" button resolves through the plan lifecycle, not a bare family_leads write', () => {
  const nav = read('tracker/crm-queue-navigation.js');
  const lifecycle = read('tracker/case-lifecycle.js');
  // ADR 0003 §5 defect #2: "Open resolution" used to call
  // AqoonApp.updateLead(leadId,{status:'resolved',notes}) directly, with no
  // family_case_plans/family_case_events trace at all - a second, lower
  // quality way to close a case that bypassed everything the case-plan
  // panel's own Resolve button does.
  assert.doesNotMatch(nav, /window\.AqoonApp\?\.updateLead\(leadId, \{status: 'resolved', notes: note\}\)/);
  assert.match(nav, /window\.AqoonCaseLifecycle\?\.resolveActivePlan\(leadId, note\)/);
  // resolveActivePlan must use the same transactional transition action as
  // the guided workflow, so the event, plan, and lead can never drift.
  assert.match(lifecycle, /async function resolveActivePlan\(leadId,note\)\{/);
  assert.match(lifecycle, /transitionCasePlan\(leadId,plan,'resolved','case_resolved'/);
  assert.doesNotMatch(lifecycle, /event_type:'case_resolved',note/);
  // A family with no plan cannot be resolved without an agreed route/action.
  assert.match(lifecycle, /if\(!plan\)\{/);
  assert.match(lifecycle, /resolveActivePlan,/);
});
