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
  assert.match(lifecycle, /lead\?\.interview_status==='completed'&&capture\)\{capture\.after\(el\)/);
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
