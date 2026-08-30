const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'caawi', 'app.js'), 'utf8');

test('a successful completed intake retires its dedup id before a different family can reuse the browser', () => {
  // The 72-hour localStorage id is only for resuming an abandoned intake.
  // Keeping it after family-intake-submit succeeds lets the next submission
  // on a shared browser overwrite the already-completed family_leads row.
  assert.match(source, /function clearRequestId\(\)\{try\{localStorage\.removeItem\('aqoon_intake_request'\)\}catch\(e\)\{\}\}/);
  assert.match(source, /\.then\(function\(\)\{clearRequestId\(\);E\('thanksTitle'\)/);
  assert.doesNotMatch(source, /\.catch\(function\(\)\{clearRequestId\(\)/);
});
