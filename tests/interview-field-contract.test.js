const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const context = {};
vm.createContext(context);
vm.runInContext(read('tracker/interview-contract.js'), context);
const contract = context.AqoonInterviewContract;

function values(source, regex) {
  return [...source.matchAll(regex)].map(match => match[1]);
}

function activeRenderedKeys() {
  const match = read('tracker/interview-match.js');
  const proof = read('tracker/universal-proof-questions.js');
  const ux = read('tracker/interview-ux-v4.js');
  const enhancements = read('tracker/interview-form-enhancements.js');
  const preview = read('tracker/interview-match-preview.js');
  const keys = new Set([
    ...values(match, /\[\s*['"]([a-z][a-z0-9_]*)['"]\s*,\s*['"][^'"]+['"]\s*,\s*['"](?:select|multi|text|number|date)['"]/g),
    ...values(proof, /\brow\(\s*['"]([a-z][a-z0-9_]*)['"]\s*,/g),
    ...values(ux, /addCanonical\(\s*['"]([a-z][a-z0-9_]*)['"]\s*,/g),
    ...(enhancements.includes('data-key="job_search_profile"') ? ['job_search_profile'] : []),
  ]);
  for (const key of values(enhancements, /addConditionNote\([^,]+,\s*['"]([a-z][a-z0-9_]*)['"]/g)) keys.add(`${key}_notes`);
  const inputMap = preview.match(/const INPUTS=\{([\s\S]*?)\};\nconst UI_EQUIVALENTS/)?.[1] || '';
  for (const key of values(inputMap, /(?:^|,)\s*([a-z][a-z0-9_]*)\s*:/g)) keys.add(key);
  keys.add('operator_context_notes');
  return [...keys].sort();
}

test('every active interview field has provenance, purpose, consumers, privacy and correction ownership', () => {
  const missing = activeRenderedKeys().filter(key => !contract.fields[key]);
  assert.deepEqual(missing, []);
  for (const key of activeRenderedKeys()) {
    const field = contract.fields[key];
    assert.ok(field.source, `${key} has no source/provenance`);
    assert.ok(field.purpose, `${key} has no purpose`);
    assert.ok(field.consumers.length, `${key} has no consumer`);
    assert.equal(field.privacy, 'private_operational', `${key} has no privacy class`);
    assert.ok(field.correction, `${key} has no correction path`);
  }
});

test('future signals and evidence cannot silently become route-match facts', () => {
  for (const group of ['future_signal', 'evidence']) {
    for (const key of contract.groups[group]) {
      assert.equal(contract.fields[key].consumers.includes('route_match'), false, key);
    }
  }
  assert.deepEqual(
    Array.from(contract.researchTopics(['work'], { cross_service_needs_all: ['Finnish / education'] })),
    ['work'],
  );
  assert.deepEqual(
    Array.from(contract.researchTopics(['work'], { work_search_scope: 'Work plus training options' })),
    ['work', 'education'],
  );
});

test('canonical payload owns route topics, notes, next action and schema version before fetch', () => {
  const payload = contract.buildSavePayload({
    leadId: 'synthetic-lead',
    routeTopics: ['work'],
    answers: { primary_situation: 'Studying', cross_service_needs_all: ['Kela / benefits'] },
    summary: 'Synthetic summary',
    researchPrompt: 'Synthetic prompt',
    nextAction: 'Call with work options',
    followUp: '2026-09-08T10:00:00.000Z',
    urgency: 'normal',
  });
  assert.equal(payload.interview_schema_version, 'first-interview-v5');
  assert.equal(payload.interview_type, 'work');
  assert.equal(payload.answers.main_status, 'Studying');
  assert.equal(payload.next_action, 'Call with work options');
});
