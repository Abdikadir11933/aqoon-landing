const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('database transition is atomic, idempotent, and service-role only', () => {
  const sql = read('supabase/migrations/20260901135656_atomic_case_plan_transitions.sql');
  assert.match(sql, /create or replace function public\.aqoon_transition_case_plan/);
  assert.match(sql, /for update;/);
  assert.match(sql, /request_id = p_request_id/);
  assert.match(sql, /update public\.family_case_plans[\s\S]*insert into public\.family_case_events[\s\S]*update public\.family_leads/);
  assert.match(sql, /security definer[\s\S]*set search_path = ''/);
  assert.match(sql, /revoke all on function public\.aqoon_transition_case_plan[\s\S]*from authenticated/);
  assert.match(sql, /grant execute on function public\.aqoon_transition_case_plan[\s\S]*to service_role/);
});

test('lifecycle endpoint attributes and classifies transactional transitions', () => {
  const edge = read('supabase/functions/family-case-lifecycle-admin/index.ts');
  assert.match(edge, /if \(action === "transition_plan"\)/);
  assert.match(edge, /p_operator_id: operatorId/);
  assert.match(edge, /db\.rpc\("aqoon_transition_case_plan"/);
  assert.match(edge, /"stale_plan_status"[\s\S]*409/);
  assert.doesNotMatch(edge, /\["ready_for_review", "reviewed", "selected"\]/);
});

test('guided follow-up uses one transition call per operator action', () => {
  const flow = read('tracker/followup-workflow-v2.js');
  assert.match(flow, /action:'transition_plan'/);
  assert.match(flow, /request_id:crypto\.randomUUID\(\)/);
  assert.match(flow, /transitionPlan\(plan,'action_in_progress','options_presented'/);
  assert.match(flow, /transitionPlan\(plan,'awaiting_outcome','official_action_started'/);
  assert.match(flow, /transitionPlan\(plan,'persistence_check','official_response_received'/);
  assert.match(flow, /transitionPlan\(plan,'resolved','case_resolved'/);
  assert.match(flow, /transitionPlan\(plan,'closed_unresolved','case_closed_unresolved'/);
  assert.doesNotMatch(flow, /event_type:'options_presented'\}\)\.catch/);
  assert.doesNotMatch(flow, /event_type:'follow_up_attempted'.*\.catch/);
});

test('legacy lifecycle controls also use the atomic transition endpoint', () => {
  const lifecycle = read('tracker/case-lifecycle.js');
  assert.match(lifecycle, /async function transitionCasePlan/);
  assert.match(lifecycle, /return transitionCasePlan\(leadId,plan,'resolved','case_resolved'/);
  assert.doesNotMatch(lifecycle, /await api\(END_LIFECYCLE,\{action:'log_event'.*event_type:'case_resolved'/);
});
