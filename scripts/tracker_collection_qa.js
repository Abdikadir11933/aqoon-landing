#!/usr/bin/env node
'use strict';

// Static contract check for the tracker/server collection and action boundary.
// Live schema/function parity is checked separately against Supabase; this
// catches repository drift before deployment.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FUNCTIONS = path.join(ROOT, 'supabase', 'functions');
const TRACKER = path.join(ROOT, 'tracker');
const expected = new Set([
  'family_call_log', 'family_case_events', 'family_case_interactions',
  'family_case_plans', 'family_funnel_events', 'family_future_opportunities',
  'family_intake_contacts', 'family_intake_rate_limits',
  'family_interview_revisions', 'family_interviews', 'family_leads',
  'family_match_runs', 'family_scenario_research', 'family_scenarios',
  'knowledge_routes', 'knowledge_sources', 'operators', 'ops_events',
  'partner_programs', 'sales_activities', 'sales_opportunities'
]);
const seen = new Map();

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith('.ts')) {
      const source = fs.readFileSync(file, 'utf8');
      for (const match of source.matchAll(/\.from\(["']([^"']+)["']\)/g)) {
        const collection = match[1];
        if (!seen.has(collection)) seen.set(collection, []);
        seen.get(collection).push(path.relative(ROOT, file));
      }
    }
  }
}

walk(FUNCTIONS);
const unknown = [...seen.keys()].filter(name => !expected.has(name));
const unused = [...expected].filter(name => !seen.has(name));
const errors = [];
if (unknown.length) errors.push(`Unknown tracker collections: ${unknown.join(', ')}`);
if (unused.length) errors.push(`Expected but unreferenced collections: ${unused.join(', ')}`);

// High-value browser/server action contracts. These are the actions whose
// absence can leave a visible control present while the server returns
// unknown_action. Keep this list intentionally small and operational.
const requiredActions = {
  'family-leads-admin': [
    'whoami', 'claim_operator', 'ping', 'operators', 'call_log', 'list',
    'match_preview', 'save_interview', 'analytics', 'record_call_outcome', 'update'
  ],
  'family-leads-manage': ['create', 'update', 'move_phase', 'delete'],
  'family-case-lifecycle-admin': ['batch_list', 'summary', 'get_call_history', 'list', 'save_plan', 'log_event'],
  'ops-admin': ['operators', 'list', 'save_opportunity', 'delete_opportunity', 'add_activity', 'save_event', 'delete_event']
};
for (const [slug, actions] of Object.entries(requiredActions)) {
  const file = path.join(FUNCTIONS, slug, 'index.ts');
  if (!fs.existsSync(file)) {
    errors.push(`Missing Edge Function source: ${slug}`);
    continue;
  }
  const source = fs.readFileSync(file, 'utf8');
  for (const action of actions) {
    const re = new RegExp(`\\baction\\s*={2,3}\\s*["']${action}["']`);
    if (!re.test(source)) errors.push(`${slug} is missing required action: ${action}`);
  }
}

// The compact phase controls depend specifically on family-leads-manage's
// persisted update/move_phase actions and must use the shared JWT headers.
const phaseFile = path.join(TRACKER, 'phase-controls-v1.js');
if (!fs.existsSync(phaseFile)) errors.push('Missing active tracker file: phase-controls-v1.js');
else {
  const phase = fs.readFileSync(phaseFile, 'utf8');
  if (!phase.includes("action:'update'")) errors.push('phase-controls-v1.js no longer calls update');
  if (!phase.includes("action:'move_phase'")) errors.push('phase-controls-v1.js no longer calls move_phase');
  if (!phase.includes('window.AqoonAuthHeaders()')) errors.push('phase-controls-v1.js is not using operator JWT headers');
  if (phase.includes('x-tracker-password')) errors.push('phase-controls-v1.js still sends removed shared-password header');
}

if (errors.length) {
  errors.forEach(error => console.error(error));
  process.exit(1);
}
console.log(`Tracker contract OK: ${seen.size} collections referenced and critical endpoint actions present.`);
