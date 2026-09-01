const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('child-led interviews capture siblings and the caregiver as separate future-demand signals', () => {
  const universal = read('tracker/universal-proof-questions.js');
  assert.match(universal, /other_children_stages/);
  assert.match(universal, /caregiver_future_goal/);
  assert.match(universal, /child_activity_interest/);
  assert.match(universal, /other_child_daycare_timing/);
  assert.match(universal, /Age bands only — do not record names here/);
});

test('operator chooses a short close and the three evidence questions are optional', () => {
  const universal = read('tracker/universal-proof-questions.js');
  assert.match(universal, /relationship_close_scope/);
  assert.match(universal, /Primary need only/);
  assert.match(universal, /Ask 3 quick access questions/);
  assert.match(universal, /Explore another need the family raised/);
  assert.match(universal, /entry_service_awareness/);
  assert.match(universal, /entry_service_self_navigation/);
  assert.match(universal, /entry_blockers/);
  assert.doesNotMatch(universal, /row\('system_navigation_confidence'/);
});

test('household opportunity signals remain available without being forced into every call', () => {
  const universal = read('tracker/universal-proof-questions.js');
  for (const key of ['other_children_stages','caregiver_future_goal','child_activity_interest','other_child_daycare_timing']) {
    assert.match(universal, new RegExp("question\\([^\\n]+count\\(core,'" + key + "'\\)"));
  }
  assert.match(universal, /showGroup\('household-discovery',explore\)/);
});

test('saved household opportunities are visible in the family workspace', () => {
  const lifecycle = read('tracker/case-lifecycle.js');
  const next = read('tracker/interview-next-steps.js');
  assert.match(lifecycle, /Household & future opportunities/);
  assert.match(lifecycle, /contact_permission_status/);
  assert.match(lifecycle, /lc\.opportunities\|\|\[\]/);
  assert.match(next, /householdOpportunities/);
  assert.doesNotMatch(next, /there is no automatic link to a sales opportunity yet/);
});

test('non-applicable household branches stay closed and one-off work is explicit', () => {
  const universal = read('tracker/universal-proof-questions.js');
  const interview = read('tracker/interview-match.js');
  assert.match(universal, /hasYoung=kids\.includes\('Under 3'\)\|\|kids\.includes\('Age 3–6'\)/);
  assert.match(universal, /showGroup\('daycare',explore&&hasYoung\)/);
  assert.match(universal, /showGroup\('other-child-daycare',explore&&hasYoung\)/);
  assert.match(universal, /No children/);
  assert.match(universal, /No other children/);
  assert.match(interview, /work_search_scope/);
  assert.match(interview, /One specific job \/ pilot \/ shift/);
  assert.match(universal, /oneOff=selected\('work_search_scope'\)\[0\]==='One specific job \/ pilot \/ shift'/);
  assert.match(universal, /showGroup\('relationship-gate',!oneOff\)/);
  assert.match(universal, /showGroup\('household-discovery',explore\)/);
  assert.match(universal, /updates\.classList\.toggle\('hidden',!explore\)/);
});

test('jobseeker-only profile question inherits the unemployed branch', () => {
  const enhancements = read('tracker/interview-form-enhancements.js');
  assert.match(enhancements, /question\.dataset\.branch=anchorQuestion\.dataset\.branch/);
  assert.match(enhancements, /question\.dataset\.branchSource=anchorQuestion\.dataset\.branchSource/);
});
