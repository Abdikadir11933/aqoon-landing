const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase/migrations/20260901193000_canonical_household_person_need_model.sql'), 'utf8');

test('canonical graph separates household, people, needs and interview coverage', () => {
  for (const table of ['family_households', 'family_people', 'family_needs', 'family_interview_needs']) {
    assert.match(sql, new RegExp(`create table if not exists public\\.${table}`));
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`));
  }
  assert.match(sql, /family_people_one_contact_per_household_idx/);
  assert.match(sql, /unique \(source_lead_id, source_position\)/);
  assert.match(sql, /family_interview_needs_family_need_id_idx/);
});

test('existing and future leads are synchronized without storing another plaintext phone', () => {
  assert.match(sql, /extensions\.digest\(regexp_replace\(lower\(coalesce\(lead_row\.phone/);
  assert.doesNotMatch(sql, /family_households[\s\S]{0,500}\bphone\s+text/);
  assert.match(sql, /after insert or update of phone, city, main_need, sub_need, age_group, additional_needs/);
  assert.match(sql, /for lead_id in select id from public\.family_leads/);
});

test('multiple intake needs remain separate records and removed positions archive safely', () => {
  assert.match(sql, /jsonb_array_elements\(coalesce\(lead_row\.additional_needs/);
  assert.match(sql, /source_position/);
  assert.match(sql, /status = 'archived'/);
  assert.match(sql, /family_leads[\s\S]*primary_need_id/);
});

