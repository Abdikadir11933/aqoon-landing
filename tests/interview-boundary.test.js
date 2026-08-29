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
