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
  // resolveActivePlan must reuse the same log_event + save_plan calls the
  // panel's own Resolve action uses (case_resolved event, plan_status
  // 'resolved') so family_leads.status is set by the existing atomic fix
  // (commit 8bd435a), not a second bespoke write that could drift from it.
  assert.match(lifecycle, /async function resolveActivePlan\(leadId,note\)\{/);
  assert.match(lifecycle, /event_type:'case_resolved',note/);
  assert.match(lifecycle, /plan_status:'resolved'/);
  // A family with no plan at all must still get a real case_resolved event
  // and plan record, not be silently skipped.
  assert.match(lifecycle, /if\(!plan\)\{/);
  assert.match(lifecycle, /resolveActivePlan,/);
});
