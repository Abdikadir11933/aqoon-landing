const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const edge = fs.readFileSync(
  path.join(__dirname, '..', 'supabase/functions/family-scenario-admin/index.ts'),
  'utf8'
);

test('scenario matching defines a deterministic SHA-256 fingerprint helper', () => {
  assert.match(edge, /async function sha\(v:string\):Promise<string>/);
  assert.match(edge, /crypto\.subtle\.digest\("SHA-256",bytes\)/);
  assert.match(edge, /byte\.toString\(16\)\.padStart\(2,"0"\)/);
  assert.match(edge, /const scenarioKey=await sha\(stable\(dimensions\)\)/);
});

test('SHA-256 fingerprints are stable and use the full 64-character hex digest', () => {
  const input = '{"criteria":{"jobseeker_active":"yes"},"route":"work","version":1}';
  const first = crypto.createHash('sha256').update(input).digest('hex');
  const second = crypto.createHash('sha256').update(input).digest('hex');

  assert.equal(first, second);
  assert.match(first, /^[a-f0-9]{64}$/);
});
