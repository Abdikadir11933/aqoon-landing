const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('completed interviews are logged once by the database trigger, not again by browser code', () => {
  const app = read('tracker/app.js');
  const lifecycle = read('tracker/case-lifecycle.js');
  assert.doesNotMatch(app, /logInterviewCompleted/);
  assert.doesNotMatch(lifecycle, /logInterviewCompleted/);
});

test('Tracker management controls use the operator session, never a shared password', () => {
  const phaseControls = read('tracker/phase-controls-v1.js');
  assert.doesNotMatch(phaseControls, /aqoon_tracker_password|x-tracker-password|function pw\(/);
  assert.match(phaseControls, /window\.AqoonAuthHeaders\(\)/);
});

test('non-work interview topics use scenario gates instead of exposing every detail at once', () => {
  const interview = read('tracker/interview-match.js');
  assert.match(interview, /const DETAIL_BRANCHES=/);
  assert.match(interview, /education_entry_reason/);
  assert.match(interview, /care_reason/);
  assert.match(interview, /activity_goal/);
  assert.match(interview, /school_situation/);
  assert.match(interview, /program_reason/);
  assert.match(interview, /authority_issue/);
  assert.match(interview, /function applyInterviewContext\(\)/);
  assert.match(interview, /data-branch-source/);
});

test('single-topic interviews do not repeat the intake as three universal questions', () => {
  const interview = read('tracker/interview-match.js');
  assert.match(interview, /const needsUniversalContext=rs\.length>1\|\|rs\.includes\('general'\)/);
  assert.match(interview, /needsUniversalContext\?universalContext\.map/);
});

test('every released scenario has an explicit maximum matching-question budget', () => {
  const contractSource = read('tracker/interview-contract.js');
  for (const scenario of ['one_specific_work','student_part_time_work','unemployed_work','work_plus_training','education','daycare','hobby','school_child','program','service_support','general_or_mixed']) {
    assert.match(contractSource, new RegExp(`${scenario}:\\d+`));
  }
});

test('changing a scenario clears hidden answers and no hidden answer can be saved', () => {
  const interview = read('tracker/interview-match.js');
  const universal = read('tracker/universal-proof-questions.js');
  assert.match(interview, /function clearQuestion\(node\)/);
  assert.match(interview, /if\(wasVisible&&!on\)clearQuestion\(node\)/);
  assert.match(interview, /if\(!x\.closest\('\.hidden'\)&&x\.value\.trim\(\)\)/);
  assert.match(interview, /if\(r\.closest\('\.hidden'\)\)return/);
  assert.match(universal, /if\(!on\).*choice\.on/);
});
