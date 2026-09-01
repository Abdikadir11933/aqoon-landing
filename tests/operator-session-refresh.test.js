const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'tracker/operator-identity.js'), 'utf8');

test('operator JWT refresh is single-flight and happens before private API calls', () => {
  assert.match(source, /refreshPromise=null/);
  assert.match(source, /function tokenExpiresSoon/);
  assert.match(source, /grant_type=refresh_token/);
  assert.match(source, /if\(!refreshPromise\)refreshPromise=/);
  assert.match(source, /const token=await refreshAuthSession\(false\)/);
});

test('a private endpoint 401 refreshes and retries exactly once', () => {
  assert.match(source, /response\.status===401/);
  assert.match(source, /await refreshAuthSession\(true\)/);
  assert.match(source, /response=await orig\(input,retryInit\)/);
  assert.doesNotMatch(source, /location\.reload\(\).*refreshAuthSession/);
});
