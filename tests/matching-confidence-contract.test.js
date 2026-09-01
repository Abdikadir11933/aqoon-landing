const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('match preview excludes stale or unverified knowledge and explains coverage gaps', () => {
  const edge = read('supabase/functions/family-leads-admin/index.ts');
  assert.doesNotMatch(edge, /\.eq\("verification_state",\s*"verified"\)/);
  assert.match(edge, /const coverageIssues/);
  assert.match(edge, /route_recheck_due/);
  assert.match(edge, /criterion_recheck_due/);
  assert.match(edge, /source_recheck_due/);
  assert.match(edge, /coverage_gaps: coverageGaps/);
});

test('a route with no executable criteria is never a confirmed match', () => {
  const edge = read('supabase/functions/family-leads-admin/index.ts');
  assert.match(edge, /if \(!\(r\.knowledge_criteria \|\| \[\]\)\.length\)/);
  assert.match(edge, /No executable criteria are stored for this route/);
  assert.match(edge, /missing\.length \|\| confirmationNeeded\.length[\s\S]*"possible_must_confirm"/);
});

test('confirmed route selection is recomputed server-side from current case facts', () => {
  const edge = read('supabase/functions/family-case-lifecycle-admin/index.ts');
  assert.match(edge, /Never trust a browser's empty missing\/conflict arrays/);
  assert.match(edge, /needDomainsForLead\(lead, factsUsed\)/);
  assert.match(edge, /evaluateRouteCriteria\(criteria/);
  assert.match(edge, /confirmed_route_requires_research/);
  assert.match(edge, /evaluated\.needsConfirmation\.length/);
  assert.match(edge, /route_not_applicable_to_case/);
});

test('database rejects confirmed matches backed by incomplete or stale knowledge', () => {
  const sql = read('supabase/migrations/20260901220000_confirmed_match_knowledge_guard.sql');
  assert.match(sql, /before insert or update of match_status, route_id/);
  assert.match(sql, /selected_route\.recheck_after is null/);
  assert.match(sql, /criterion\.recheck_after is null/);
  assert.match(sql, /source\.recheck_after is null/);
  assert.match(sql, /confirmed_route_requires_research/);
});

test('follow-up only exposes direct use for a fully confirmed candidate', () => {
  const flow = read('tracker/followup-workflow-v2.js');
  assert.match(flow, /ready=c\.match_status==='confirmed_match'&&!missing\.length&&!confirm\.length&&!conf\.length/);
  assert.match(flow, /confirmation_needed:c\.confirmation_needed\|\|\[\]/);
  assert.match(flow, /HUMAN \/ AUTHORITY CONFIRMATIONS/);
});

test('research cannot become a plan without a structured human decision', () => {
  const flow = read('tracker/followup-workflow-v2.js');
  assert.match(flow, /fuResearchVerdict/);
  assert.match(flow, /fuResearchSources/);
  assert.match(flow, /fuResearchDecisionNote/);
  assert.match(flow, /research_verdict:verdict/);
  assert.match(flow, /research_sources_checked:true/);
  assert.match(flow, /operator_decision_note:decisionNote/);
});

test('knowledge coverage gaps are visible instead of silently disappearing', () => {
  const preview = read('tracker/interview-match-preview.js');
  const flow = read('tracker/followup-workflow-v2.js');
  assert.match(preview, /Knowledge needs review/);
  assert.match(preview, /No current verified route is mapped/);
  assert.match(flow, /coverageGaps=mp\.coverage_gaps\|\|\[\]/);
  assert.match(flow, /Knowledge needs review/);
});
