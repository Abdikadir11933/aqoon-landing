const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('route feedback is structured, PII-minimized, reviewed and never auto-applied', () => {
  const sql = read('supabase/migrations/20260901171000_operator_route_feedback_learning.sql');
  const table = sql.match(/create table if not exists public\.knowledge_feedback_signals \([\s\S]*?\n\);/)?.[0] || '';
  assert.match(sql, /create table if not exists public\.knowledge_feedback_signals/);
  assert.match(sql, /reason_code text not null/);
  assert.match(sql, /criterion_fields text\[\]/);
  assert.match(sql, /review_status text not null default 'pending_review'/);
  assert.doesNotMatch(table, /family_lead_id uuid/);
  assert.doesNotMatch(table, /\bnote text|facts_used jsonb/);
  assert.match(sql, /create or replace function public\.aqoon_save_route_review/);
  assert.match(sql, /family_leads where id = p_lead_id for update/);
  assert.match(sql, /insert into public\.family_match_runs[\s\S]*insert into public\.knowledge_feedback_signals/);
  assert.match(sql, /revoke all on public\.knowledge_feedback_signals from anon, authenticated/);
});

test('does-not-fit requires a reason and the UI explains the human review boundary', () => {
  const edge = read('supabase/functions/family-route-review-admin/index.ts');
  const flow = read('tracker/followup-workflow-v2.js');
  assert.match(edge, /REASON_CODES/);
  assert.match(edge, /feedback_reason_required/);
  assert.match(edge, /db\.rpc\("aqoon_save_route_review"/);
  assert.match(flow, /Why does this route not fit\?/);
  assert.match(flow, /It does not change eligibility rules automatically/);
  assert.match(flow, /reason_code:reasonCode/);
  assert.match(flow, /criterion_fields:criterionFields/);
  assert.match(flow, /data-fu-no[^\n]+askNoReason/);
});
