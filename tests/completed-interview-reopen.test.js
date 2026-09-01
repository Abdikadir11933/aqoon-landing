const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('an existing case-plan panel is repositioned when the same completed interview is reopened', () => {
  // host() used to return as soon as #caseLifecycle already existed, so the
  // panel kept its pre-completion position until a full page reload.
  const lifecycle = read('tracker/case-lifecycle.js');
  assert.doesNotMatch(lifecycle, /let el=\$\('caseLifecycle'\);if\(el\)return el/);
  assert.match(lifecycle, /let el=\$\('caseLifecycle'\);\s*if\(!el\)/);
  assert.match(lifecycle, /lead\?\.interview_status==='completed'\|\|!prompt\?\.classList\.contains\('hidden'\)/);
  assert.match(lifecycle, /\(prompt\|\|capture\)\.after\(el\)/);
});

test('saving the first interview immediately switches the drawer to the research and plan workflow', () => {
  const match = read('tracker/interview-match.js');
  const lifecycle = read('tracker/case-lifecycle.js');
  assert.match(match, /C\.lead\.interview_status='completed';C\.lead\.latest_interview=result\.interview;collapseIfComplete\(C\.lead\)/);
  assert.match(match, /\$\('saveInterview'\)\.textContent='Save follow-up notes'/);
  assert.match(lifecycle, /addEventListener\('aqoon:interview-saved'/);
});

test('programmatic answer restore refreshes branch visibility and the collapsed completeness summary', () => {
  // Restored .choice.on classes do not fire click/input events. Without an
  // explicit completion signal the reopened summary stayed at stale 0 / N.
  const restore = read('tracker/interview-answers-restore.js');
  const match = read('tracker/interview-match.js');
  assert.match(restore, /notifyRestored\(\).*aqoon:interview-answers-restored/);
  assert.match(restore, /applyTo\(host\);\s*notifyRestored\(\)/);
  assert.match(match, /addEventListener\('aqoon:interview-answers-restored',\(\)=>\{applyWorkContext\(\);renderCompleteness\(\)\}\)/);
});

test('answer restore reapplies after a scenario module replaces a choice row', () => {
  const restore = read('tracker/interview-answers-restore.js');
  assert.match(restore, /root\.matches\?\.\('\[data-key\]'\)/);
  assert.match(restore, /applyTo\(m\.target\)/);
});
