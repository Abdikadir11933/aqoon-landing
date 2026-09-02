#!/usr/bin/env node
'use strict';
// Regenerates tracker/bundle.css. Tracker JavaScript is intentionally loaded
// as explicit, ordered deferred files in index.html so security-sensitive
// source can be audited and deployed without a stale generated JS bundle.
//
// Run after editing CSS files listed below:
//   node scripts/build_tracker_bundle.js
// tests/tracker-bundle.test.js verifies the CSS bundle and the explicit
// JavaScript loading order.

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
  'interview-contract.js',
  'visual-v3.js', 'crm-reactive.js', 'interview-match.js', 'interview-match-preview.js', 'interview-form-enhancements.js',
  'interview-smart-notes.js', 'interview-answers-restore.js', 'case-lifecycle.js',
  'scenario-learning.js', 'interview-context.js', 'interview-follow-up-recap.js',
  'interview-next-steps.js', 'household-people.js', 'universal-proof-questions.js', 'incomplete-intake.js',
  'human-labels.js', 'analytics-mobile-v2.js', 'crm-manage.js', 'operations-system.js',
  'call-outcomes.js', 'crm-queue-navigation.js', 'interview-ux-v4.js',
  'followup-workflow-v2.js', 'followup-panel-v2.js', 'followup-plan-confirm-v1.js',
  'phase-controls-v1.js'
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
  const jsHeader = '// Tracker JavaScript is loaded explicitly, in order, by tracker/index.html.\n' +
    '// This file remains only for backwards-compatible caches and contains no app logic.\n';
  return {
    css: cssHeader + concat(CSS_FILES, '/*'),
    js: jsHeader
  };
}

module.exports = { buildBundles, CSS_FILES, JS_FILES };

if (require.main === module) {
  const { css, js } = buildBundles();
  fs.writeFileSync(path.join(TRACKER, 'bundle.css'), css);
  fs.writeFileSync(path.join(TRACKER, 'bundle.js'), js);
  console.log('Wrote tracker/bundle.css and tracker/bundle.js');
}
