const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('sales demand dedupes by household and controlled need domain', async () => {
  const { buildDemandRows, demandAggregate } = await import('../supabase/functions/_shared/demand-aggregate.mjs');
  const now = Date.parse('2026-09-01T12:00:00Z');
  const rows = buildDemandRows({
    nowMs: now,
    leads: [
      { id: 'lead-1', household_id: 'home-1', city: 'Vantaa', interview_status: 'completed' },
      { id: 'lead-2', household_id: 'home-1', city: 'Vantaa', interview_status: 'completed' },
    ],
    needs: [
      { id: 'need-1', source_lead_id: 'lead-1', household_id: 'home-1', need_domain: 'daycare' },
      { id: 'need-2', source_lead_id: 'lead-2', household_id: 'home-1', need_domain: 'daycare' },
    ],
    plans: [{ family_need_id: 'need-1', plan_status: 'research' }],
    futureOpportunities: [
      { family_lead_id: 'lead-2', need_domain: 'daycare', status: 'ready', contact_permission_status: 'granted', earliest_contact_at: '2026-09-01T10:00:00Z' },
      { family_lead_id: 'lead-1', need_domain: 'hobby', status: 'ready', contact_permission_status: 'granted', earliest_contact_at: '2026-09-01T10:00:00Z' },
      { family_lead_id: 'lead-1', need_domain: 'school', status: 'ready', contact_permission_status: 'declined', earliest_contact_at: '2026-09-01T10:00:00Z' },
      { family_lead_id: 'lead-1', need_domain: 'work', status: 'ready', contact_permission_status: 'granted', earliest_contact_at: '2027-01-01T10:00:00Z' },
    ],
  });
  assert.deepEqual(rows.map(row => [row.need_domain, row.interest_state]).sort(), [['daycare', 'stated_need'], ['hobby', 'ready_future']]);
  const aggregate = demandAggregate(rows);
  assert.equal(aggregate.total_active, 2);
  assert.equal(aggregate.total_unmatched, 2);
  assert.equal(aggregate.metric_contract.dedupe_unit, 'household + need_domain');
});

test('sales opportunity matching uses domain, area scope and interest state', async () => {
  const { opportunityDemand } = await import('../supabase/functions/_shared/demand-aggregate.mjs');
  const rows = [
    { need_domain: 'daycare', city: 'Vantaa', interview_status: 'completed', interest_state: 'stated_need' },
    { need_domain: 'daycare', city: 'Espoo', interview_status: 'completed', interest_state: 'ready_future' },
    { need_domain: 'work', city: 'Vantaa', interview_status: 'completed', interest_state: 'stated_need' },
  ];
  assert.deepEqual(opportunityDemand(rows, 'daycare', 'Vantaa / Helsinki / Espoo', 'stated_or_ready'), { total: 2, past_interview: 2, ready_future: 1 });
  assert.deepEqual(opportunityDemand(rows, 'daycare', 'Vantaa', 'stated_need'), { total: 1, past_interview: 1, ready_future: 0 });
  assert.equal(opportunityDemand(rows, null, null, null), null);
});

test('analytics separates completed interviews from active case plans', () => {
  const edge = read('supabase/functions/family-case-lifecycle-admin/index.ts');
  const ui = read('tracker/analytics-mobile-v2.js');
  assert.match(edge, /completed_interviews:/);
  assert.match(edge, /interviews_awaiting_route:/);
  assert.match(edge, /active_cases:/);
  assert.match(edge, /dedupe_unit: "family_lead"/);
  assert.match(edge, /dedupe_unit: "case_plan"/);
  assert.match(ui, /Completed interviews/);
  assert.match(ui, /Awaiting route decision/);
  assert.match(ui, /Active case plans/);
});

test('fingerprint misses do not create empty scenario or research queue rows', () => {
  const edge = read('supabase/functions/family-scenario-admin/index.ts');
  const matchBlock = edge.match(/if\(action==="match_scenario"\)\{[\s\S]*?\n  \}\n\n  if\(action==="get_scenario"/)?.[0] || '';
  assert.doesNotMatch(matchBlock, /from\("family_scenarios"\)\.upsert|from\("family_scenario_research"\)\.insert/);
  assert.match(matchBlock, /matched_scenario_id:scenario\?\.id\|\|null/);
  const ui = read('tracker/scenario-learning.js');
  assert.match(ui, /will not create an empty learning task automatically/);
});

test('operator corrections have a human review boundary and cannot auto-edit knowledge', () => {
  const migration = read('supabase/migrations/20260901223000_analytics_sales_learning_contract.sql');
  const edge = read('supabase/functions/family-route-review-admin/index.ts');
  const analytics = read('tracker/analytics-mobile-v2.js');
  assert.match(migration, /aqoon_review_route_feedback_signal/);
  assert.match(migration, /official_source_check_required/);
  assert.match(migration, /knowledge_change_reference_required/);
  assert.doesNotMatch(migration.match(/create or replace function public\.aqoon_review_route_feedback_signal[\s\S]*?\$\$;/)?.[0] || '', /update public\.knowledge_routes/);
  assert.match(edge, /action === "learning_summary"/);
  assert.match(edge, /action === "review_feedback"/);
  assert.match(analytics, /Learning review/);
  assert.match(analytics, /Mark applied after knowledge update/);
});
