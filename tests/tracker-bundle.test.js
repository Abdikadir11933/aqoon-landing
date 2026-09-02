const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildBundles, JS_FILES } = require('../scripts/build_tracker_bundle.js');

test('tracker CSS bundle and explicit JavaScript loading order match their sources', () => {
  const { css, js } = buildBundles();
  const checkedInCss = fs.readFileSync(path.join(__dirname, '..', 'tracker', 'bundle.css'), 'utf8');
  const checkedInJs = fs.readFileSync(path.join(__dirname, '..', 'tracker', 'bundle.js'), 'utf8');
  assert.equal(checkedInCss, css, 'tracker/bundle.css is stale - run `node scripts/build_tracker_bundle.js`');
  assert.equal(checkedInJs, js, 'tracker/bundle.js is stale - run `node scripts/build_tracker_bundle.js`');
  const html = fs.readFileSync(path.join(__dirname, '..', 'tracker', 'index.html'), 'utf8');
  const loaded = [...html.matchAll(/<script\s+src="\/tracker\/([^"?]+)(?:\?[^"?]*)?"\s+defer><\/script>/g)].map(match => match[1]);
  assert.deepEqual(loaded, JS_FILES, 'tracker/index.html must load exactly the declared scripts in the declared order');
});
