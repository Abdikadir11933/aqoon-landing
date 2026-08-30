const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('the funnel drop-note attaches the loss to the stage that lost the sessions, not the stage before it', () => {
  const visual = read('tracker/visual-v3.js');
  // enhanceFunnel() used to compute lost=vals[i]-vals[i+1] and append that
  // note to row i - i.e. the OUTGOING loss to the next stage, but rendered
  // on the CURRENT stage. Read left to right that looks like "Contact
  // screen: -24 lost" when the 24 were actually lost leaving Contact screen
  // for Started typing, not arriving at Contact screen. Funnels are read as
  // "this many were lost getting HERE", so the note must describe the
  // INCOMING transition (previous stage -> this stage) and the first stage
  // (nothing precedes it) must show no note at all.
  assert.doesNotMatch(visual, /if\(i>=rows\.length-1\)return;const from=vals\[i\],to=vals\[i\+1\]/);
  assert.match(visual, /if\(i===0\)return;const from=managed\?Number\(r\.dataset\.funnelBase\)/);
});
