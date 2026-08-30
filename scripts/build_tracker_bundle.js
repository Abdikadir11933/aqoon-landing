#!/usr/bin/env node
'use strict';
// Regenerates tracker/bundle.css and tracker/bundle.js by concatenating the
// tracker's individual source files, in the exact order they used to load
// as separate <link>/<script> tags. Pure concatenation only - no minifying,
// no reordering - so cascade order (CSS) and execution order (JS, all
// `defer`) are identical to before. Every JS file here is either a
// self-contained `(()=>{...})()` IIFE or (crm-queue-navigation.js only) a
// single top-level `const`, so concatenating them introduces no scope
// collisions; verified by hand before this script was written.
//
// Run after editing ANY of the source files listed below:
//   node scripts/build_tracker_bundle.js
// tests/tracker-bundle.test.js fails if the checked-in bundle drifts from
// what this script would produce, so a forgotten regenerate is caught by
// the normal test run, not discovered as a silent production bug.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TRACKER = path.join(ROOT, 'tracker');

const CSS_FILES = [
  'app.css', 'crm-reactive.css', 'usability.css', 'research-analytics.css',
  'analytics-mobile-v2.css', 'crm-manage.css', 'analytics-actions.css',
  'operations-system.css', 'workspace-ux.css', 'call-outcomes.css',
  'crm-call-history.css', 'crm-queue-layout.css'
];

const JS_FILES = [
  'operator-identity.js', 'crm-call-history.js', 'multineed-adapter.js', 'app.js',
  'visual-v3.js', 'crm-reactive.js', 'interview-match.js', 'interview-match-preview.js', 'interview-form-enhancements.js',
  'interview-smart-notes.js', 'interview-answers-restore.js', 'case-lifecycle.js',
  'scenario-learning.js', 'interview-context.js', 'interview-follow-up-recap.js',
  'interview-next-steps.js', 'universal-proof-questions.js', 'incomplete-intake.js',
  'human-labels.js', 'analytics-mobile-v2.js', 'crm-manage.js', 'operations-system.js',
  'call-outcomes.js', 'crm-queue-navigation.js'
];

function concat(files, commentPrefix) {
  return files.map(name => {
    const content = fs.readFileSync(path.join(TRACKER, name), 'utf8').replace(/\s+$/, '');
    return `${commentPrefix} ---- ${name} ----${commentPrefix === '/*' ? ' */' : ''}\n${content}\n`;
  }).join('\n');
}

function buildBundles() {
  const cssHeader = '/* GENERATED FILE - do not edit directly. Edit the source .css files and\n' +
    '   run `node scripts/build_tracker_bundle.js` to regenerate.\n' +
    '   tests/tracker-bundle.test.js fails if this drifts from the sources. */\n\n';
  const jsHeader = '// GENERATED FILE - do not edit directly. Edit the source .js files and\n' +
    '// run `node scripts/build_tracker_bundle.js` to regenerate.\n' +
    '// tests/tracker-bundle.test.js fails if this drifts from the sources.\n\n';
  return {
    css: cssHeader + concat(CSS_FILES, '/*'),
    js: jsHeader + concat(JS_FILES, '//')
  };
}

module.exports = { buildBundles, CSS_FILES, JS_FILES };

if (require.main === module) {
  const { css, js } = buildBundles();
  fs.writeFileSync(path.join(TRACKER, 'bundle.css'), css);
  fs.writeFileSync(path.join(TRACKER, 'bundle.js'), js);
  console.log('Wrote tracker/bundle.css and tracker/bundle.js');
}
