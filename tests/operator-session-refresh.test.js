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

test('a failed refresh stops replaying the stale token and pauses private traffic', () => {
  assert.match(source, /authRefreshBlocked=true/);
  assert.match(source, /return force\?'':current/);
  assert.match(source, /privateEndpoint&&authRefreshBlocked/);
  assert.match(source, /aqoon:auth-expired/);
});

test('signing in again resumes the open tracker without a page reload', () => {
  const app = fs.readFileSync(path.join(__dirname, '..', 'tracker/app.js'), 'utf8');
  assert.match(source, /aqoon:auth-restored/);
  assert.match(app, /addEventListener\('aqoon:auth-restored',resumeAfterAuth\)/);
  assert.match(app, /function resumeAfterAuth/);
  assert.match(app, /reopenDrawerAfterAuth/);
  assert.match(app, /drawer\?\.classList\.add\('hidden'\)/);
  assert.match(app, /if\(reopenDrawerAfterAuth\).*classList\.remove\('hidden'\)/);
});

test('operators can recover a forgotten password without an admin-created shared secret', () => {
  const root = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const tracker = fs.readFileSync(path.join(__dirname, '..', 'tracker/index.html'), 'utf8');
  assert.match(source, /auth\/v1\/recover\?redirect_to=/);
  assert.match(source, /auth\/v1\/user'[\s\S]*method:'PUT'/);
  assert.match(source, /p\.get\('type'\)!=='recovery'/);
  assert.match(source, /history\.replaceState/);
  assert.match(source, /Forgot password\?/);
  assert.match(source, /pickerMode='reset'/);
  assert.match(root, /location\.replace\('\/tracker\/'\+location\.hash\)/);
  assert.match(tracker, /operator-identity\.js\?v=4/);
});
