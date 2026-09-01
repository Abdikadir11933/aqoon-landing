const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('named partner handoffs have a private explicit-consent boundary', () => {
  const sql = read('supabase/migrations/20260901224500_partner_handoff_consent_contract.sql');
  assert.match(sql, /create table if not exists public\.family_partner_handoffs/);
  assert.match(sql, /alter table public\.family_partner_handoffs enable row level security/);
  assert.match(sql, /revoke all on table public\.family_partner_handoffs from public, anon, authenticated/);
  assert.match(sql, /consent_scope <@ array\['full_name','phone','city','need_summary','application_documents'\]/);
  assert.match(sql, /if not coalesce\(p_consent_granted,false\)/);
  assert.match(sql, /stage in \('won','delivery','expansion'\)/);
  assert.match(sql, /partner_need_domain_mismatch/);
  assert.match(sql, /route_not_currently_verified/);
  assert.doesNotMatch(sql, /insert into public\.sales_(?:opportunities|activities)[\s\S]*family_lead_id/);
});

test('handoff start, outcome and withdrawal are atomic workflow actions', () => {
  const sql = read('supabase/migrations/20260901224500_partner_handoff_consent_contract.sql');
  const edge = read('supabase/functions/family-case-lifecycle-admin/index.ts');
  const ui = read('tracker/followup-workflow-v2.js');
  assert.match(sql, /create or replace function public\.aqoon_start_partner_handoff/);
  assert.match(sql, /create or replace function public\.aqoon_record_partner_handoff_outcome/);
  assert.match(sql, /create or replace function public\.aqoon_withdraw_partner_handoff/);
  assert.match(sql, /partner_handoff_withdrawn/);
  assert.match(edge, /action === "start_partner_handoff"/);
  assert.match(edge, /action === "record_partner_handoff_outcome"/);
  assert.match(edge, /action === "withdraw_partner_handoff"/);
  assert.match(ui, /Separate consent boundary/);
  assert.match(ui, /data-consent-scope="phone"/);
  assert.match(ui, /Family withdrew handoff consent/);
  assert.match(ui, /No won\/delivery partner is configured/);
});

test('the browser cannot forge route disclosure metadata at selection', () => {
  const edge = read('supabase/functions/family-case-lifecycle-admin/index.ts');
  assert.match(edge, /select\("id,route_key,need_domain,scope,required_inputs,partner_disclosure_required,/);
  assert.match(edge, /partner_disclosure_required: Boolean\(route\.partner_disclosure_required\)/);
  assert.match(edge, /route_key: route\.route_key/);
  assert.match(edge, /need_domain: route\.need_domain/);
});

test('sales and analytics expose aggregate handoff outcomes without family PII', () => {
  const ops = read('supabase/functions/ops-admin/index.ts');
  const lifecycle = read('supabase/functions/family-case-lifecycle-admin/index.ts');
  const salesUi = read('tracker/operations-system.js');
  const analyticsUi = read('tracker/analytics-mobile-v2.js');
  assert.match(ops, /family_partner_handoffs/);
  assert.match(ops, /handoff_counts/);
  assert.match(lifecycle, /partner_handoff_withdrawals/);
  assert.match(salesUi, /recorded outcome/);
  assert.match(analyticsUi, /Partner handoffs started/);
  assert.match(analyticsUi, /Consent withdrawals/);
  assert.doesNotMatch(ops.match(/db\.from\("family_partner_handoffs"\)[^\n]+/)?.[0] || '', /family_lead_id|recipient_organisation|outcome_note/);
});
