const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('raw intake cannot load the verified-route preview', () => {
  const html = read('tracker/index.html');
  assert.doesNotMatch(html, /<script[^>]+interview-match-preview\.js/);
});

test('first interviews only reveal prior context when it actually exists', () => {
  const context = read('tracker/interview-context.js');
  assert.match(context, /if\(!summary&&!prompt&&!nextAction\)\{host\.innerHTML='';host\.classList\.add\('hidden'\);return\}/);
  assert.match(context, /Previous interview & research/);
});

test('interview UI describes topics, not pre-decided routes', () => {
  const interview = read('tracker/interview-match.js');
  assert.match(interview, /Interview topics:/);
  assert.match(interview, /Save first interview & prepare research brief/);
});

test('a call cannot move an unfinished interview into follow-up or resolution', () => {
  const admin = read('supabase/functions/family-leads-admin/index.ts');
  const queue = read('tracker/crm-queue-navigation.js');
  assert.match(admin, /select\("id,status,journey_stage,interview_status"\)/);
  assert.match(admin, /current\.interview_status==="completed"/);
  assert.match(admin, /completed_interview_required/);
  assert.match(queue, /return-to-first-contact/);
  assert.match(queue, /Interview still required/);
});
