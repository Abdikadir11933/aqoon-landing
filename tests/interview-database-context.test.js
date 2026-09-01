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
