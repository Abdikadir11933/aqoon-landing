const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildBundles } = require('../scripts/build_tracker_bundle.js');

test('tracker/bundle.css and bundle.js match what the source files would produce', () => {
  const { css, js } = buildBundles();
  const checkedInCss = fs.readFileSync(path.join(__dirname, '..', 'tracker', 'bundle.css'), 'utf8');
  const checkedInJs = fs.readFileSync(path.join(__dirname, '..', 'tracker', 'bundle.js'), 'utf8');
  assert.equal(checkedInCss, css, 'tracker/bundle.css is stale - run `node scripts/build_tracker_bundle.js`');
  assert.equal(checkedInJs, js, 'tracker/bundle.js is stale - run `node scripts/build_tracker_bundle.js`');
});
