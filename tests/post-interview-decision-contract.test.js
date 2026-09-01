const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('family agreement is an explicit yes, not-sure, or no decision with context', () => {
  const flow = read('tracker/followup-workflow-v2.js');
  assert.match(flow, /Yes — agreed to proceed/);
  assert.match(flow, /Not sure — follow up/);
  assert.match(flow, /No — choose another route/);
  assert.match(flow, /fuAgreementNote/);
  assert.match(flow, /fuAgreementDate/);
  assert.match(flow, /decision:'agreed'/);
  assert.match(flow, /decision:'not_sure'/);
  assert.match(flow, /decision:'declined'/);
});

test('pending decisions and waiting outcomes require a future follow-up', () => {
  const flow = read('tracker/followup-workflow-v2.js');
  const sql = read('supabase/migrations/20260901221000_post_interview_decision_contract.sql');
  assert.match(flow, /Choose a future follow-up time/);
  assert.match(flow, /next_follow_up_at:next\.toISOString\(\)/);
  assert.match(sql, /future_follow_up_required/);
  assert.match(sql, /p_event_type in \('family_decision_pending','follow_up_attempted'\)/);
});

test('agreement, action, result and outcome evidence are required at the database boundary', () => {
  const sql = read('supabase/migrations/20260901221000_post_interview_decision_contract.sql');
  assert.match(sql, /'family_route_agreed','family_decision_pending','family_route_declined'/);
  assert.match(sql, /'options_presented','official_action_started','official_response_received'/);
  assert.match(sql, /'follow_up_attempted','case_resolved','case_closed_unresolved'/);
  assert.match(sql, /transition_note_required/);
});

test('researched-route approval saves evidence, plan, event and lead state atomically', () => {
  const edge = read('supabase/functions/family-case-lifecycle-admin/index.ts');
  const sql = read('supabase/migrations/20260901221000_post_interview_decision_contract.sql');
  const flow = read('tracker/followup-workflow-v2.js');
  assert.match(edge, /action === "approve_researched_route"/);
  assert.match(edge, /db\.rpc\("aqoon_approve_researched_route"/);
  assert.match(sql, /research_approval_evidence_required/);
  assert.match(sql, /update public\.family_case_plans[\s\S]*insert into public\.family_case_events[\s\S]*update public\.family_leads/);
  assert.match(flow, /action:'approve_researched_route'/);
});

test('save_plan can edit a state but cannot bypass a workflow transition', () => {
  const edge = read('supabase/functions/family-case-lifecycle-admin/index.ts');
  assert.match(edge, /new_plan_must_start_in_research/);
  assert.match(edge, /plan_transition_requires_workflow_action/);
  assert.match(edge, /planStatus !== currentPlan\.plan_status/);
  assert.match(edge, /terminal_plan_requires_reopen/);
  assert.match(edge, /plan\.next_follow_up_at = currentPlan\.next_follow_up_at/);
});

test('manual plans are evidence-gated research, never instant options-ready plans', () => {
  const panel = read('tracker/followup-panel-v2.js');
  assert.match(panel, /Research another route/);
  assert.match(panel, /manual_route:true,provisional_route:true/);
  assert.match(panel, /plan_status:'research'/);
  assert.doesNotMatch(panel, /selected_option:\{manual:true\},plan_status:'options_ready'/);
});

test('case reopening is one transactional endpoint call', () => {
  const lifecycle = read('tracker/case-lifecycle.js');
  const edge = read('supabase/functions/family-case-lifecycle-admin/index.ts');
  const sql = read('supabase/migrations/20260901221000_post_interview_decision_contract.sql');
  assert.match(lifecycle, /action:'reopen_case'/);
  assert.doesNotMatch(lifecycle, /action:'log_event'[\s\S]*source:'resolved_queue'[\s\S]*updateLead/);
  assert.match(edge, /db\.rpc\("aqoon_reopen_family_case"/);
  assert.match(sql, /create or replace function public\.aqoon_reopen_family_case/);
});

test('case plans are linked to an explicit canonical need where available', () => {
  const flow = read('tracker/followup-workflow-v2.js');
  const preview = read('supabase/functions/family-leads-admin/index.ts');
  const sql = read('supabase/migrations/20260901221000_post_interview_decision_contract.sql');
  assert.match(flow, /family_need_id:candidateNeedId\(c\)/);
  assert.match(preview, /need_domain: r\.need_domain/);
  assert.match(sql, /family_case_plans_target_need/);
  assert.match(sql, /invalid_plan_need/);
});
