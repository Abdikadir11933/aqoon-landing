const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('research briefs reuse interviews, verified route previews, and structured case-plan evidence already loaded for the family', () => {
  const app = read('tracker/app.js');
  const match = read('tracker/interview-match.js');
  const preview = read('tracker/interview-match-preview.js');
  const lifecycle = read('tracker/case-lifecycle.js');
  assert.match(app, /get interviews\(\)\{return interviews\}/);
  assert.match(app, /interviews=l\.interviews\|\|\[\]/);
  assert.match(match, /function priorInterviewContext\(\)/);
  assert.match(match, /PRIOR SAVED INTERVIEW CONTEXT — do not ask again unless the fact may have changed/);
  assert.match(match, /function verifiedPlanContext\(\)/);
  assert.match(match, /PREVIOUSLY VERIFIED CASE-PLAN RESEARCH — reuse while current/);
  assert.match(match, /CURRENT VERIFIED-ROUTE PREVIEW — generated from knowledge_routes\/criteria\/sources/);
  assert.match(preview, /addEventListener\('aqoon:interview-saved'/);
  assert.match(preview, /action:'match_preview'/);
  assert.match(lifecycle, /contextForLead:id=>id===leadId\?\{plans:\[\.\.\.plans\],events:\[\.\.\.events\],opportunities:\[\.\.\.opportunities\]\}/);
});

test('scenario matching receives the saved interview id directly instead of racing a delayed list refetch', () => {
  const scenario = read('tracker/scenario-learning.js');
  assert.match(scenario, /addEventListener\('aqoon:interview-saved',event=>syncSaved\(event\.detail\)\)/);
  assert.match(scenario, /interview_id:interview\.id/);
  assert.doesNotMatch(scenario, /action:'list'/);
  assert.doesNotMatch(scenario, /setTimeout\(sync/);
});

test('deep research stays pending until an operator checks sources and explicitly approves it', () => {
  const edge = read('supabase/functions/family-scenario-admin/index.ts');
  const scenario = read('tracker/scenario-learning.js');
  const migration = read('supabase/migrations/20260901180000_scenario_research_human_approval.sql');
  assert.match(edge, /action==="approve_research"/);
  assert.match(edge, /changed_canonical_knowledge:false/);
  assert.match(edge, /review_status:"pending_review"/);
  assert.doesNotMatch(edge, /status:"verified",last_verified_at:now/);
  assert.match(scenario, /I checked the official sources and the answer against them/);
  assert.match(scenario, /action:'approve_research'/);
  assert.match(migration, /p_official_sources_checked is not true/);
  assert.match(migration, /review_status = 'approved'/);
  assert.match(migration, /update public\.family_interviews[\s\S]*scenario_match_status = 'matched'/);
  assert.match(migration, /revoke all on function public\.aqoon_approve_scenario_research[\s\S]*from authenticated/);
});
