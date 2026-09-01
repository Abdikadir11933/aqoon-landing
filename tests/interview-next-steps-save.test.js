const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('Next Steps attaches from a confirmed save event regardless of which interview handler owns the button', () => {
  // The live drawer could retain app.js's original onclick reference even
  // though interview-next-steps wrapped window.saveInterview later. The
  // wrapper therefore never ran and the awaiting-outcome card stayed hidden.
  const app = read('tracker/app.js');
  const match = read('tracker/interview-match.js');
  const next = read('tracker/interview-next-steps.js');
  assert.match(app, /announceSaved:detail=>window\.dispatchEvent\(new CustomEvent\('aqoon:interview-saved'/);
  assert.match(app, /\.then\(result=>\{[\s\S]*window\.AqoonInterview\.announceSaved/);
  assert.match(match, /const result=await api\([\s\S]*AqoonInterview\?\.announceSaved\?\./);
  assert.match(next, /window\.addEventListener\('aqoon:interview-saved',[\s\S]*attach\(lead,answers\)/);
  assert.doesNotMatch(next, /window\.saveInterview=async function/);
});
