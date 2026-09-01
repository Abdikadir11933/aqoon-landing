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

test('every adult interview ends with three short system-access signals', () => {
  const universal = read('tracker/universal-proof-questions.js');
  assert.match(universal, /system_navigation_confidence/);
  assert.match(universal, /digital_application_independence/);
  assert.match(universal, /official_service_connections/);
  assert.match(universal, /not proof of eligibility or active status/);
});

test('new household and system signals are included in aggregate analytics', () => {
  const universal = read('tracker/universal-proof-questions.js');
  for (const key of ['other_children_stages','caregiver_future_goal','child_activity_interest','other_child_daycare_timing','system_navigation_confidence','digital_application_independence','official_service_connections']) {
    assert.match(universal, new RegExp("question\\([^\\n]+count\\(core,'" + key + "'\\)"));
  }
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
  assert.match(universal, /showGroup\('daycare',hasYoung\)/);
  assert.match(universal, /showGroup\('other-child-daycare',hasYoung\)/);
  assert.match(universal, /No children/);
  assert.match(universal, /No other children/);
  assert.match(interview, /work_search_scope/);
  assert.match(interview, /One specific job \/ pilot \/ shift/);
});
