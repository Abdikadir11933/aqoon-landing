#!/usr/bin/env node
'use strict';

// Static contract check for the tracker/server collection boundary. The live
// schema is checked separately with Supabase; this catches code drift in CI.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const expected = new Set([
  'family_call_log', 'family_case_events', 'family_case_interactions',
  'family_case_plans', 'family_funnel_events', 'family_future_opportunities',
  'family_intake_contacts', 'family_interview_revisions', 'family_interviews',
  'family_leads', 'family_match_runs', 'family_scenario_research',
  'family_scenarios', 'knowledge_routes', 'knowledge_sources', 'operators',
  'ops_events', 'partner_programs', 'sales_activities', 'sales_opportunities'
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

walk(path.join(ROOT, 'supabase', 'functions'));
const unknown = [...seen.keys()].filter(name => !expected.has(name));
const unused = [...expected].filter(name => !seen.has(name));
if (unknown.length || unused.length) {
  if (unknown.length) console.error(`Unknown tracker collections: ${unknown.join(', ')}`);
  if (unused.length) console.error(`Expected but unreferenced collections: ${unused.join(', ')}`);
  process.exit(1);
}
console.log(`Tracker collection contract OK: ${seen.size} collections referenced.`);
